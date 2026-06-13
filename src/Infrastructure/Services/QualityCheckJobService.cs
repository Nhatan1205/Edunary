using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.IO;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.CourseReviews.Services;
using Edunary.Application.CourseReviews.Queries.GetCourseChangesComparisonQuery;
using Edunary.Application.SystemSettings.Queries.GetAIConfigQuery;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Edunary.Infrastructure.Data;
using Hangfire;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Edunary.Infrastructure.Services;

public class QualityCheckJobService : IQualityCheckJobService
{
    private readonly ApplicationDbContext _context;
    private readonly ISender _sender;
    private readonly IAICenterClient _aiCenterClient;
    private readonly IAppHubService _hub;
    private readonly ILogger<QualityCheckJobService> _logger;

    public QualityCheckJobService(
        ApplicationDbContext context,
        ISender sender,
        IAICenterClient aiCenterClient,
        IAppHubService hub,
        ILogger<QualityCheckJobService> logger)
    {
        _context = context;
        _sender = sender;
        _aiCenterClient = aiCenterClient;
        _hub = hub;
        _logger = logger;
    }

    public void EnqueueQualityCheck(string userId, int courseId, int reportId)
    {
        BackgroundJob.Enqueue<IQualityCheckJobService>(svc =>
            svc.ProcessQualityCheckAsync(userId, courseId, reportId));
    }

    public async Task ProcessQualityCheckAsync(string userId, int courseId, int reportId)
    {
        try
        {
            await SendProgress(userId, 10, "Initializing course review...", reportId);
            await Task.Delay(1000);

            var report = await _context.QualityCheckReports
                .FirstOrDefaultAsync(r => r.Id == reportId);

            if (report == null)
            {
                _logger.LogError("Report with id {ReportId} not found.", reportId);
                return;
            }

            var course = await _context.Courses
                .Include(c => c.Category)
                .Include(c => c.Topics)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course == null)
            {
                report.Status = QualityCheckStatus.Failed;
                await _context.SaveChangesAsync(default);
                await SendProgress(userId, -1, "The requested course could not be found. Please try again.", reportId);
                return;
            }

            await SendProgress(userId, 25, "Checking course structure and requirements...", reportId);
            await Task.Delay(1000);

            // 1. Run pre-flight checks
            var preFlightIssues = await RunPreFlightChecksAsync(course);

            await SendProgress(userId, 50, "Analyzing course content and objectives...", reportId);
            await Task.Delay(1000);

            // 2. Fetch AI configuration
            var aiConfig = await _sender.Send(new GetAIConfigQuery());

            // 3. Parse curriculum and pre-fetch rich data for content batching
            var parsedContent = ParseCurriculum(course.Content);
            
            var quizzes = await _context.Quizzes
                .Include(q => q.Questions)
                .ThenInclude(q => q.Choices)
                .Where(q => q.CourseId == course.Id)
                .AsNoTracking()
                .ToListAsync();

            var assignments = await _context.Assignments
                .Include(a => a.Questions)
                .Where(a => a.CourseId == course.Id)
                .AsNoTracking()
                .ToListAsync();

            var mediaCaptionsMap = await FetchMediaCaptionsMapAsync(parsedContent);

            // 4. Construct plain text for each section and group them into batches
            var sectionTexts = new List<(string SectionTitle, string Text, List<string> ItemIds)>();

            foreach (var section in parsedContent)
            {
                var sb = new StringBuilder();
                var sectionItemIds = new List<string>();
                sb.AppendLine($"# Section: {section.Title}");
                if (!string.IsNullOrWhiteSpace(section.LearningObjectives))
                {
                    sb.AppendLine($"* Objectives: {StripHtml(section.LearningObjectives)}");
                }
                sb.AppendLine();

                if (section.Items != null)
                {
                    foreach (var item in section.Items)
                    {
                        var itemType = item.GetResolvedType();
                        sectionItemIds.Add(item.ItemId);

                        if (itemType == "article")
                        {
                            var plainText = StripHtml(item.Content ?? "");
                            sb.AppendLine($"## Lecture: {item.Title} (Article)");
                            sb.AppendLine(plainText);
                            sb.AppendLine();
                        }
                        else if (itemType == "video" && item.VideoId > 0)
                        {
                            sb.AppendLine($"## Lecture: {item.Title} (Video)");
                            
                            if (mediaCaptionsMap.TryGetValue(item.VideoId, out var mediaFile))
                            {
                                var caption = mediaFile.VideoCaptions?
                                    .FirstOrDefault(c => c.Status == CaptionStatus.COMPLETED);
                                
                                if (caption != null && !string.IsNullOrWhiteSpace(caption.FileUrl))
                                {
                                    var vttText = await DownloadAndParseVttAsync(caption.FileUrl);
                                    if (!string.IsNullOrWhiteSpace(vttText))
                                    {
                                        sb.AppendLine(vttText);
                                    }
                                }
                            }
                            sb.AppendLine();
                        }
                        else if (itemType == "quiz")
                        {
                            sb.AppendLine($"## Quiz: {item.Title}");
                            var quiz = quizzes.FirstOrDefault(q => q.ItemId == item.ItemId);
                            if (quiz != null)
                            {
                                sb.AppendLine($"* Title: {quiz.Title}");
                                sb.AppendLine("Questions:");
                                foreach (var q in quiz.Questions)
                                {
                                    sb.AppendLine($"- Question: {StripHtml(q.Name)} ({q.Type})");
                                }
                            }
                            sb.AppendLine();
                        }
                        else if (itemType == "assignment")
                        {
                            sb.AppendLine($"## Assignment: {item.Title}");
                            var assign = assignments.FirstOrDefault(a => a.ItemId == item.ItemId);
                            if (assign != null)
                            {
                                sb.AppendLine($"* Title: {assign.Title}");
                                sb.AppendLine($"* Instructions: {StripHtml(assign.Instructions)}");
                            }
                            sb.AppendLine();
                        }
                    }
                }
                
                sectionTexts.Add((section.Title ?? "Untitled Section", sb.ToString(), sectionItemIds));
            }

            var contentBatches = new List<object>();
            var currentBatchSections = new List<string>();
            var currentBatchItemIds = new List<string>();
            var currentBatchText = new StringBuilder();
            int currentBatchWordCount = 0;
            int batchIndex = 1;

            foreach (var sec in sectionTexts)
            {
                int secWordCount = EstimateWordCount(sec.Text);

                if (currentBatchWordCount + secWordCount > 6000 && currentBatchSections.Any())
                {
                    contentBatches.Add(new
                    {
                        batch_index = batchIndex++,
                        sections = currentBatchSections.ToList(),
                        item_ids = currentBatchItemIds.ToList(),
                        content_text = currentBatchText.ToString()
                    });

                    currentBatchSections.Clear();
                    currentBatchItemIds.Clear();
                    currentBatchText.Clear();
                    currentBatchWordCount = 0;
                }

                currentBatchSections.Add(sec.SectionTitle);
                currentBatchItemIds.AddRange(sec.ItemIds);
                currentBatchText.AppendLine(sec.Text);
                currentBatchWordCount += secWordCount;
            }

            if (currentBatchSections.Any())
            {
                contentBatches.Add(new
                {
                    batch_index = batchIndex++,
                    sections = currentBatchSections,
                    item_ids = currentBatchItemIds.ToList(),
                    content_text = currentBatchText.ToString()
                });
            }

            var curriculum = parsedContent
                .Select(s => new
                {
                    section_title = s.Title ?? "",
                    learning_objectives = StripHtml(s.LearningObjectives ?? ""),
                    items = s.Items?.Select(i => (object)new
                    {
                        title = i.Title ?? "",
                        content_type = i.GetResolvedType()
                    }).ToList() ?? new List<object>()
                }).ToList();

            var payload = new
            {
                course_id = course.Id,
                course_title = course.Title ?? "",
                course_subtitle = course.Subtitle ?? "",
                course_description = StripHtml(course.Description ?? ""),
                course_category = course.Category?.Title ?? "None",
                course_topics = course.Topics?.Select(t => t.Name).ToList() ?? new List<string>(),
                learning_objectives = DeserializeList(course.LearningObjectives),
                requirements = DeserializeList(course.Requirements),
                target_audience = DeserializeList(course.TargetAudience),
                curriculum,
                content_batches = contentBatches,
                llm_config = new
                {
                    model_name = aiConfig.LLMModelName,
                    api_key = aiConfig.LLMApiKey,
                    api_base = aiConfig.LLMBaseUrl,
                    temperature = 0.2,
                    max_tokens = aiConfig.LLMMaxTokens
                },
                embedding_config = new
                {
                    provider = aiConfig.EmbeddingProvider,
                    model_name = aiConfig.EmbeddingModelName,
                    api_key = aiConfig.EmbeddingApiKey,
                    base_url = aiConfig.EmbeddingBaseUrl
                },
                qdrant_config = new
                {
                    url = aiConfig.QdrantUrl,
                    api_key = aiConfig.QdrantApiKey,
                    collection = "edunary_curriculum"
                }
            };

            // File.WriteAllText("payload_full.json", JsonSerializer.Serialize(payload, new JsonSerializerOptions { WriteIndented = true }));

            var url = $"{aiConfig.AICenterBaseUrl}api/quality-check/analyze";
            var (isSuccess, body) = await _aiCenterClient.PostAsync(
                url, aiConfig.AICenterApiKey, JsonSerializer.Serialize(payload));

            var aiIssues = new List<QualityCheckIssue>();
            string analysisSummary = "Quality check finished.";

            if (isSuccess)
            {
                aiIssues = ParseAiIssues(body, reportId);
                try
                {
                    var aiResponse = JsonSerializer.Deserialize<JsonElement>(body);
                    if (aiResponse.TryGetProperty("analysis_summary", out var summaryEl))
                    {
                        analysisSummary = summaryEl.GetString() ?? analysisSummary;
                    }
                }
                catch {}
            }
            else
            {
                _logger.LogWarning("AI Center request failed. Pre-flight results only. Body: {Body}", body);
                analysisSummary = "The AI quality analysis service is temporarily unavailable. Full check contains pre-flight checks only.";
            }

            await SendProgress(userId, 80, "Compiling review results and generating report...", reportId);
            await Task.Delay(1000);

            var allIssues = new List<QualityCheckIssue>();
            foreach (var issue in preFlightIssues)
            {
                issue.ReportId = reportId;
                allIssues.Add(issue);
            }
            allIssues.AddRange(aiIssues);

            foreach (var issue in allIssues)
            {
                _context.QualityCheckIssues.Add(issue);
            }

            var overallScore = CalculateOverallScore(allIssues);

            report.Status = QualityCheckStatus.Completed;
            report.OverallScore = overallScore;
            report.AnalysisSummary = analysisSummary;

            await _context.SaveChangesAsync(default);

            await SendProgress(userId, 100, "Course review completed successfully!", reportId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "QualityCheckJobService failed.");
            try
            {
                var report = await _context.QualityCheckReports.FirstOrDefaultAsync(r => r.Id == reportId);
                if (report != null)
                {
                    report.Status = QualityCheckStatus.Failed;
                    await _context.SaveChangesAsync(default);
                }
            }
            catch {}
            await SendProgress(userId, -1, "An unexpected error occurred during the quality check.", reportId);
        }
    }

    public void EnqueueQualityCheckDiff(string userId, int courseId, int reportId)
    {
        BackgroundJob.Enqueue<IQualityCheckJobService>(svc =>
            svc.ProcessQualityCheckDiffAsync(userId, courseId, reportId));
    }

    public async Task ProcessQualityCheckDiffAsync(string userId, int courseId, int reportId)
    {
        try
        {
            await SendProgress(userId, 10, "Initializing diff-based course review...", reportId);
            await Task.Delay(1000);

            var report = await _context.QualityCheckReports
                .FirstOrDefaultAsync(r => r.Id == reportId);

            if (report == null)
            {
                _logger.LogError("Report with id {ReportId} not found.", reportId);
                return;
            }

            var course = await _context.Courses
                .Include(c => c.Category)
                .Include(c => c.Topics)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course == null)
            {
                report.Status = QualityCheckStatus.Failed;
                await _context.SaveChangesAsync(default);
                await SendProgress(userId, -1, "The requested course could not be found. Please try again.", reportId);
                return;
            }

            await SendProgress(userId, 25, "Running snapshot comparison...", reportId);
            await Task.Delay(1000);

            // 1. Send MediatR query to fetch snapshot comparison diff!
            var diff = await _sender.Send(new GetCourseChangesComparisonQuery { CourseId = courseId });

            // FALLBACK: If no snapshot baseline exists, fallback to a full check
            if (diff.NoSnapshot)
            {
                _logger.LogWarning("No snapshot found for course {CourseId}. Falling back to full quality check.", courseId);
                await SendProgress(userId, 15, "No snapshot baseline found. Falling back to full quality check...", reportId);
                
                // Set IsDiff flag to false in database since it is running full check
                report.IsDiff = false;
                await _context.SaveChangesAsync(default);

                await ProcessQualityCheckAsync(userId, courseId, reportId);
                return;
            }

            var changedFields = new List<string>();
            var changedSectionIds = new HashSet<string>();
            var changedItemIds = new HashSet<string>();

            if (diff.HasChanges)
            {
                // Gather modified field names from groups
                foreach (var group in diff.ChangeGroups)
                {
                    changedFields.AddRange(group.Changes.Select(c => c.Field));
                }

                // Gather curriculum section and item changes
                foreach (var secComp in diff.CurriculumComparison)
                {
                    if (secComp.Status == "added" || secComp.Status == "modified")
                    {
                        changedSectionIds.Add(secComp.SectionId);
                        foreach (var itemComp in secComp.Items)
                        {
                            if (itemComp.Status == "added" || itemComp.Status == "modified")
                            {
                                changedItemIds.Add(itemComp.ItemId);
                            }
                        }
                    }
                }

                // Gather quiz changes
                foreach (var qComp in diff.QuizComparison)
                {
                    if ((qComp.Status == "added" || qComp.Status == "modified") && !string.IsNullOrEmpty(qComp.ItemId))
                    {
                        changedItemIds.Add(qComp.ItemId);
                    }
                }

                // Gather assignment changes
                foreach (var aComp in diff.AssignmentComparison)
                {
                    if ((aComp.Status == "added" || aComp.Status == "modified") && !string.IsNullOrEmpty(aComp.ItemId))
                    {
                        changedItemIds.Add(aComp.ItemId);
                    }
                }
            }

            await SendProgress(userId, 40, "Checking structure and pre-flight rules...", reportId);
            
            // 2. Run pre-flight checks only on changed fields and items
            var preFlightIssues = await RunPreFlightChecksDiffAsync(course, changedFields, changedItemIds);

            await SendProgress(userId, 55, "Extracting updated content batches...", reportId);

            var aiConfig = await _sender.Send(new GetAIConfigQuery());
            var parsedContent = ParseCurriculum(course.Content);
            var mediaCaptionsMap = await FetchMediaCaptionsMapAsync(parsedContent);

            // Fetch current quizzes and assignments to construct their batch texts
            var quizzes = await _context.Quizzes
                .Include(q => q.Questions)
                .ThenInclude(q => q.Choices)
                .Where(q => q.CourseId == course.Id)
                .AsNoTracking()
                .ToListAsync();

            var assignments = await _context.Assignments
                .Include(a => a.Questions)
                .Where(a => a.CourseId == course.Id)
                .AsNoTracking()
                .ToListAsync();

            // 3. Construct batch texts ONLY for changed sections & items
            var sectionTexts = new List<(string SectionTitle, string Text, List<string> ItemIds)>();

            foreach (var section in parsedContent)
            {
                bool hasSectionChanges = changedSectionIds.Contains(section.SectionId);
                
                if (hasSectionChanges)
                {
                    var sb = new StringBuilder();
                    var sectionItemIds = new List<string>();
                    sb.AppendLine($"# Section: {section.Title}");
                    if (!string.IsNullOrWhiteSpace(section.LearningObjectives))
                    {
                        sb.AppendLine($"* Objectives: {StripHtml(section.LearningObjectives)}");
                    }
                    sb.AppendLine();

                    bool hasAddedOrModifiedItems = false;

                    if (section.Items != null)
                    {
                        foreach (var item in section.Items)
                        {
                            // Only include items that are added or modified
                            if (!changedItemIds.Contains(item.ItemId))
                            {
                                continue;
                            }

                            hasAddedOrModifiedItems = true;
                            sectionItemIds.Add(item.ItemId);
                            var itemType = item.GetResolvedType();

                            if (itemType == "article")
                            {
                                var plainText = StripHtml(item.Content ?? "");
                                sb.AppendLine($"## Lecture: {item.Title} (Article)");
                                sb.AppendLine(plainText);
                                sb.AppendLine();
                            }
                            else if (itemType == "video" && item.VideoId > 0)
                            {
                                sb.AppendLine($"## Lecture: {item.Title} (Video)");
                                
                                if (mediaCaptionsMap.TryGetValue(item.VideoId, out var mediaFile))
                                {
                                    var caption = mediaFile.VideoCaptions?
                                        .FirstOrDefault(c => c.Status == CaptionStatus.COMPLETED);
                                    
                                    if (caption != null && !string.IsNullOrWhiteSpace(caption.FileUrl))
                                    {
                                        var vttText = await DownloadAndParseVttAsync(caption.FileUrl);
                                        if (!string.IsNullOrWhiteSpace(vttText))
                                        {
                                            sb.AppendLine(vttText);
                                        }
                                    }
                                }
                                sb.AppendLine();
                            }
                            else if (itemType == "quiz")
                            {
                                sb.AppendLine($"## Quiz: {item.Title}");
                                var quiz = quizzes.FirstOrDefault(q => q.ItemId == item.ItemId);
                                if (quiz != null)
                                {
                                    sb.AppendLine($"* Title: {quiz.Title}");
                                    sb.AppendLine("Questions:");
                                    foreach (var q in quiz.Questions)
                                    {
                                        sb.AppendLine($"- Question: {StripHtml(q.Name)} ({q.Type})");
                                    }
                                }
                                sb.AppendLine();
                            }
                            else if (itemType == "assignment")
                            {
                                sb.AppendLine($"## Assignment: {item.Title}");
                                var assign = assignments.FirstOrDefault(a => a.ItemId == item.ItemId);
                                if (assign != null)
                                {
                                    sb.AppendLine($"* Title: {assign.Title}");
                                    sb.AppendLine($"* Instructions: {StripHtml(assign.Instructions)}");
                                }
                                sb.AppendLine();
                            }
                        }
                    }

                    // Only send this section text to AI if there was a structural section change or actual items within it changed
                    if (hasAddedOrModifiedItems || secCompStatusIsAdded(diff, section.SectionId))
                    {
                        sectionTexts.Add((section.Title ?? "Untitled Section", sb.ToString(), sectionItemIds));
                    }
                }
            }

            var contentBatches = new List<object>();
            var currentBatchSections = new List<string>();
            var currentBatchItemIds = new List<string>();
            var currentBatchText = new StringBuilder();
            int currentBatchWordCount = 0;
            int batchIndex = 1;

            foreach (var sec in sectionTexts)
            {
                int secWordCount = EstimateWordCount(sec.Text);

                if (currentBatchWordCount + secWordCount > 6000 && currentBatchSections.Any())
                {
                    contentBatches.Add(new
                    {
                        batch_index = batchIndex++,
                        sections = currentBatchSections.ToList(),
                        item_ids = currentBatchItemIds.ToList(),
                        content_text = currentBatchText.ToString()
                    });

                    currentBatchSections.Clear();
                    currentBatchItemIds.Clear();
                    currentBatchText.Clear();
                    currentBatchWordCount = 0;
                }

                currentBatchSections.Add(sec.SectionTitle);
                currentBatchItemIds.AddRange(sec.ItemIds);
                currentBatchText.AppendLine(sec.Text);
                currentBatchWordCount += secWordCount;
            }

            if (currentBatchSections.Any())
            {
                contentBatches.Add(new
                {
                    batch_index = batchIndex++,
                    sections = currentBatchSections,
                    item_ids = currentBatchItemIds.ToList(),
                    content_text = currentBatchText.ToString()
                });
            }

            // 5. Build curriculum tree representation for metadata rules
            var curriculum = parsedContent
                .Select(s => new
                {
                    section_title = s.Title ?? "",
                    learning_objectives = StripHtml(s.LearningObjectives ?? ""),
                    items = s.Items?.Select(i => (object)new
                    {
                        title = i.Title ?? "",
                        content_type = i.GetResolvedType()
                    }).ToList() ?? new List<object>()
                }).ToList();

            var payload = new
            {
                course_id = course.Id,
                course_title = course.Title ?? "",
                course_subtitle = course.Subtitle ?? "",
                course_description = StripHtml(course.Description ?? ""),
                course_category = course.Category?.Title ?? "None",
                course_topics = course.Topics?.Select(t => t.Name).ToList() ?? new List<string>(),
                learning_objectives = DeserializeList(course.LearningObjectives),
                requirements = DeserializeList(course.Requirements),
                target_audience = DeserializeList(course.TargetAudience),
                curriculum,
                content_batches = contentBatches,
                check_mode = "changes_only",
                changed_fields = changedFields,
                llm_config = new
                {
                    model_name = aiConfig.LLMModelName,
                    api_key = aiConfig.LLMApiKey,
                    api_base = aiConfig.LLMBaseUrl,
                    temperature = 0.2,
                    max_tokens = aiConfig.LLMMaxTokens
                },
                embedding_config = new
                {
                    provider = aiConfig.EmbeddingProvider,
                    model_name = aiConfig.EmbeddingModelName,
                    api_key = aiConfig.EmbeddingApiKey,
                    base_url = aiConfig.EmbeddingBaseUrl
                },
                qdrant_config = new
                {
                    url = aiConfig.QdrantUrl,
                    api_key = aiConfig.QdrantApiKey,
                    collection = "edunary_curriculum"
                }
            };

            //File.WriteAllText("payload_diff.json", JsonSerializer.Serialize(payload, new JsonSerializerOptions { WriteIndented = true }));

            await SendProgress(userId, 75, "Requesting AI Quality analysis on changes...", reportId);

            var url = $"{aiConfig.AICenterBaseUrl}api/quality-check/analyze-diff";
            var (isSuccess, body) = await _aiCenterClient.PostAsync(
                url, aiConfig.AICenterApiKey, JsonSerializer.Serialize(payload));

            var aiIssues = new List<QualityCheckIssue>();
            string analysisSummary = "Quality check diff analysis completed.";

            if (isSuccess)
            {
                aiIssues = ParseAiIssues(body, reportId);
                try
                {
                    var aiResponse = JsonSerializer.Deserialize<JsonElement>(body);
                    if (aiResponse.TryGetProperty("analysis_summary", out var summaryEl))
                    {
                        analysisSummary = summaryEl.GetString() ?? analysisSummary;
                    }
                }
                catch {}
            }
            else
            {
                _logger.LogWarning("AI Center request failed. Pre-flight results only. Body: {Body}", body);
                analysisSummary = "The AI quality analysis service is temporarily unavailable. Diff check contains pre-flight checks only.";
            }

            await SendProgress(userId, 90, "Compiling results...", reportId);

            // Combine new pre-flight issues and new AI issues. No historical merge!
            var allIssues = new List<QualityCheckIssue>();
            foreach (var issue in preFlightIssues)
            {
                issue.ReportId = reportId;
                allIssues.Add(issue);
            }
            allIssues.AddRange(aiIssues);

            // 7. Save all issues to database
            foreach (var issue in allIssues)
            {
                _context.QualityCheckIssues.Add(issue);
            }

            // 8. Calculate deterministic overall score
            var overallScore = CalculateOverallScore(allIssues);

            // 9. Finalize new report status
            report.Status = QualityCheckStatus.Completed;
            report.OverallScore = overallScore;
            report.AnalysisSummary = analysisSummary;

            await _context.SaveChangesAsync(default);

            await SendProgress(userId, 100, "Course diff quality review completed successfully!", reportId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "QualityCheckJobService diff failed.");
            try
            {
                var report = await _context.QualityCheckReports.FirstOrDefaultAsync(r => r.Id == reportId);
                if (report != null)
                {
                    report.Status = QualityCheckStatus.Failed;
                    await _context.SaveChangesAsync(default);
                }
            }
            catch {}
            await SendProgress(userId, -1, "An unexpected error occurred during the diff-based quality check. Please try again.", reportId);
        }
    }


    private bool secCompStatusIsAdded(ComparisonResultDto diff, string sectionId)
    {
        var match = diff.CurriculumComparison.FirstOrDefault(s => s.SectionId == sectionId);
        return match != null && match.Status == "added";
    }

    private async Task<List<QualityCheckIssue>> RunPreFlightChecksDiffAsync(Course course, List<string> changedFields, HashSet<string> changedItemIds)
    {
        var issues = new List<QualityCheckIssue>();

        var changedSet = new HashSet<string>(changedFields.Select(f => f.ToLowerInvariant()));

        // LP-08 — Missing cover image
        if ((changedSet.Contains("imageurl") || changedSet.Contains("course image") || changedSet.Contains("image")) && string.IsNullOrWhiteSpace(course.ImageUrl))
        {
            issues.Add(new QualityCheckIssue
            {
                Category = ReviewFeedbackCategory.CourseImage,
                Severity = QualityIssueSeverity.Warning,
                AdminAction = QualityIssueStatus.Pending,
                RuleId = "LP-08",
                Location = "Course Cover Image",
                Description = "Course cover image is missing.",
                Evidence = "",
                Suggestion = "Upload a high-quality cover image to make the course visually appealing on the marketplace."
            });
        }

        // LP-06 — Requirements missing
        if (changedSet.Contains("requirements"))
        {
            var reqList = DeserializeList(course.Requirements);
            if (reqList.Count == 0)
            {
                issues.Add(new QualityCheckIssue
                {
                    Category = ReviewFeedbackCategory.IntendedLearners,
                    Severity = QualityIssueSeverity.Warning,
                    AdminAction = QualityIssueStatus.Pending,
                    RuleId = "LP-06",
                    Location = "Course Requirements",
                    Description = "Course requirements list is empty. Students need to know what prerequisites are expected.",
                    Evidence = "",
                    Suggestion = "List all prerequisites or requirements students should meet before enrolling in this course.",
                });
            }
        }

        // LP-09 — Target audience missing
        if (changedSet.Contains("targetaudience") || changedSet.Contains("target_audience") || changedSet.Contains("target audience"))
        {
            var audList = DeserializeList(course.TargetAudience);
            if (audList.Count == 0)
            {
                issues.Add(new QualityCheckIssue
                {
                    Category = ReviewFeedbackCategory.IntendedLearners,
                    Severity = QualityIssueSeverity.Warning,
                    AdminAction = QualityIssueStatus.Pending,
                    RuleId = "LP-09",
                    Location = "Target Audience",
                    Description = "Target audience list is empty. Students cannot determine whether this course suits them.",
                    Evidence = "",
                    Suggestion = "Describe who this course is designed for so students can make an informed enrollment decision.",
                });
            }
        }

        // Parse curriculum structure
        var parsedContent = ParseCurriculum(course.Content);
        
        // CU-01 - Curriculum Structure thin check
        if (changedSet.Contains("content") || changedSet.Contains("curriculum"))
        {
            var sectionsCount = parsedContent?.Count ?? 0;
            var totalLectures = parsedContent?.Sum(s => s.Items?.Count(i => i.GetResolvedType() == "article" || i.GetResolvedType() == "video") ?? 0) ?? 0;

            if (sectionsCount < 2 || totalLectures < 5)
            {
                issues.Add(new QualityCheckIssue
                {
                    Category = ReviewFeedbackCategory.CourseContent,
                    Severity = QualityIssueSeverity.Warning,
                    AdminAction = QualityIssueStatus.Pending,
                    RuleId = "CU-01",
                    Location = "Curriculum Structure",
                    Description = $"Course curriculum is too thin: {sectionsCount} section(s) and {totalLectures} lecture(s). Minimum required is 2 sections and 5 lectures.",
                    Evidence = $"Sections: {sectionsCount}, Lectures: {totalLectures}",
                    Suggestion = "Expand the curriculum with additional sections and instructional lectures.",
                });
            }
        }

        // Lecture content size and captions
        if (parsedContent != null)
        {
            foreach (var section in parsedContent)
            {
                if (section.Items != null)
                {
                    foreach (var item in section.Items)
                    {
                        if (!changedItemIds.Contains(item.ItemId))
                        {
                            continue;
                        }

                        var itemType = item.GetResolvedType();
                        if (itemType == "article")
                        {
                            var plainText = StripHtml(item.Content ?? "");
                            var words = string.IsNullOrWhiteSpace(plainText) ? 0 : Regex.Split(plainText.Trim(), @"\s+").Length;
                            if (words < 200)
                            {
                                issues.Add(new QualityCheckIssue
                                {
                                    Category = ReviewFeedbackCategory.CourseContent,
                                    Severity = QualityIssueSeverity.Warning,
                                    AdminAction = QualityIssueStatus.Pending,
                                    RuleId = "CU-02",
                                    Location = $"Section: '{section.Title}' > Lecture: '{item.Title}'",
                                    Description = $"Article lecture is too short ({words} words). Minimum recommended length is 200 words.",
                                    Evidence = $"Lecture: '{item.Title}'",
                                    Suggestion = "Provide more comprehensive study material and context for this lecture.",
                                });
                            }
                        }
                        else if (itemType == "video" && item.VideoId > 0)
                        {
                            var mediaFile = await _context.MediaFiles
                                .Include(m => m.VideoCaptions)
                                .AsNoTracking()
                                .FirstOrDefaultAsync(m => m.Id == item.VideoId);

                            var hasCaption = mediaFile?.VideoCaptions != null &&
                                             mediaFile.VideoCaptions.Any(c => c.Status == CaptionStatus.COMPLETED);

                            if (!hasCaption)
                            {
                                issues.Add(new QualityCheckIssue
                                {
                                    Category = ReviewFeedbackCategory.VideoQuality,
                                    Severity = QualityIssueSeverity.Warning,
                                    AdminAction = QualityIssueStatus.Pending,
                                    RuleId = "CU-03",
                                    Location = $"Section: '{section.Title}' > Lecture: '{item.Title}'",
                                    Description = "Video lecture is missing a completed subtitle or caption file, reducing accessibility.",
                                    Evidence = $"Video ID: {item.VideoId}",
                                    Suggestion = "Generate captions using the AI subtitling feature or manually upload a caption file.",
                                });
                            }
                        }
                    }
                }
            }
        }

        // Quizzes
        var quizzes = await _context.Quizzes
            .Include(q => q.Questions)
            .ThenInclude(q => q.Choices)
            .Where(q => q.CourseId == course.Id)
            .AsNoTracking()
            .ToListAsync();

        foreach (var quiz in quizzes)
        {
            if (string.IsNullOrEmpty(quiz.ItemId) || !changedItemIds.Contains(quiz.ItemId))
            {
                continue;
            }

            if (quiz.Questions.Count < 3)
            {
                issues.Add(new QualityCheckIssue
                {
                    Category = ReviewFeedbackCategory.CourseContent,
                    Severity = QualityIssueSeverity.Warning,
                    AdminAction = QualityIssueStatus.Pending,
                    RuleId = "CU-04",
                    Location = $"Quiz: '{quiz.Title}'",
                    Description = $"Quiz contains only {quiz.Questions.Count} question(s). A minimum of 3 questions is required for effective assessment.",
                    Evidence = $"Quiz: '{quiz.Title}'",
                    Suggestion = "Add more questions to provide a thorough assessment of student knowledge.",
                });
            }

            foreach (var question in quiz.Questions)
            {
                var hasCorrectChoice = question.Choices.Any(c => c.IsCorrect);
                if (!hasCorrectChoice)
                {
                    issues.Add(new QualityCheckIssue
                    {
                        Category = ReviewFeedbackCategory.CourseContent,
                        Severity = QualityIssueSeverity.Critical,
                        AdminAction = QualityIssueStatus.Pending,
                        RuleId = "CU-05",
                        Location = $"Quiz: '{quiz.Title}' > Question: '{question.Name}'",
                        Description = "This quiz question has no correct answer marked. Students cannot be assessed accurately.",
                        Evidence = $"Question: '{question.Name}'",
                        Suggestion = "Mark at least one choice as the correct answer for this question.",
                    });
                }
            }
        }

        // Assignments
        var assignments = await _context.Assignments
            .Where(a => a.CourseId == course.Id)
            .AsNoTracking()
            .ToListAsync();

        foreach (var assign in assignments)
        {
            if (string.IsNullOrEmpty(assign.ItemId) || !changedItemIds.Contains(assign.ItemId))
            {
                continue;
            }

            if (string.IsNullOrWhiteSpace(assign.Instructions))
            {
                issues.Add(new QualityCheckIssue
                {
                    Category = ReviewFeedbackCategory.CourseContent,
                    Severity = QualityIssueSeverity.Warning,
                    AdminAction = QualityIssueStatus.Pending,
                    RuleId = "CU-06",
                    Location = $"Assignment: '{assign.Title}'",
                    Description = "Assignment is missing student instructions. Learners will not know how to complete the task.",
                    Evidence = $"Assignment: '{assign.Title}'",
                    Suggestion = "Add clear, detailed instructions that explain exactly what students are expected to do.",
                });
            }
        }

        return issues;
    }

    private async Task<List<QualityCheckIssue>> RunPreFlightChecksAsync(Course course)
    {
        var issues = new List<QualityCheckIssue>();

        // LP-08 — Missing cover image
        if (string.IsNullOrWhiteSpace(course.ImageUrl))
        {
            issues.Add(new QualityCheckIssue
            {
                Category = ReviewFeedbackCategory.CourseImage,
                Severity = QualityIssueSeverity.Warning,
                AdminAction = QualityIssueStatus.Pending,
                RuleId = "LP-08",
                Location = "Course Cover Image",
                Description = "Course cover image is missing.",
                Evidence = "",
                Suggestion = "Upload a high-quality cover image to make the course visually appealing on the marketplace."
            });
        }

        // LP-06 — Requirements missing
        var reqList = DeserializeList(course.Requirements);
        if (reqList.Count == 0)
        {
            issues.Add(new QualityCheckIssue
            {
                Category = ReviewFeedbackCategory.IntendedLearners,
                Severity = QualityIssueSeverity.Warning,
                AdminAction = QualityIssueStatus.Pending,
                RuleId = "LP-06",
                Location = "Course Requirements",
                Description = "Course requirements list is empty. Students need to know what prerequisites are expected.",
                Evidence = "",
                Suggestion = "List all prerequisites or requirements students should meet before enrolling in this course.",
            });
        }

        // LP-09 — Target audience missing
        var audList = DeserializeList(course.TargetAudience);
        if (audList.Count == 0)
        {
            issues.Add(new QualityCheckIssue
            {
                Category = ReviewFeedbackCategory.IntendedLearners,
                Severity = QualityIssueSeverity.Warning,
                AdminAction = QualityIssueStatus.Pending,
                RuleId = "LP-09",
                Location = "Target Audience",
                Description = "Target audience list is empty. Students cannot determine whether this course suits them.",
                Evidence = "",
                Suggestion = "Describe who this course is designed for so students can make an informed enrollment decision.",
            });
        }

        // Parse curriculum structure
        var parsedContent = ParseCurriculum(course.Content);
        var sectionsCount = parsedContent?.Count ?? 0;
        var totalLectures = parsedContent?.Sum(s => s.Items?.Count(i => i.GetResolvedType() == "article" || i.GetResolvedType() == "video") ?? 0) ?? 0;

        if (sectionsCount < 2 || totalLectures < 5)
        {
            issues.Add(new QualityCheckIssue
            {
                Category = ReviewFeedbackCategory.CourseContent,
                Severity = QualityIssueSeverity.Warning,
                AdminAction = QualityIssueStatus.Pending,
                RuleId = "CU-01",
                Location = "Curriculum Structure",
                Description = $"Course curriculum is too thin: {sectionsCount} section(s) and {totalLectures} lecture(s). Minimum required is 2 sections and 5 lectures.",
                Evidence = $"Sections: {sectionsCount}, Lectures: {totalLectures}",
                Suggestion = "Expand the curriculum with additional sections and instructional lectures.",
            });
        }

        // Lecture content size and captions
        if (parsedContent != null)
        {
            foreach (var section in parsedContent)
            {
                if (section.Items != null)
                {
                    foreach (var item in section.Items)
                    {
                        var itemType = item.GetResolvedType();
                        if (itemType == "article")
                        {
                            var plainText = StripHtml(item.Content ?? "");
                            var words = string.IsNullOrWhiteSpace(plainText) ? 0 : Regex.Split(plainText.Trim(), @"\s+").Length;
                            if (words < 200)
                            {
                                issues.Add(new QualityCheckIssue
                                {
                                    Category = ReviewFeedbackCategory.CourseContent,
                                    Severity = QualityIssueSeverity.Warning,
                                    AdminAction = QualityIssueStatus.Pending,
                                    RuleId = "CU-02",
                                    Location = $"Section: '{section.Title}' > Lecture: '{item.Title}'",
                                    Description = $"Article lecture is too short ({words} words). Minimum recommended length is 200 words.",
                                    Evidence = $"Lecture: '{item.Title}'",
                                    Suggestion = "Provide more comprehensive study material and context for this lecture.",
                                });
                            }
                        }
                        else if (itemType == "video" && item.VideoId > 0)
                        {
                            var mediaFile = await _context.MediaFiles
                                .Include(m => m.VideoCaptions)
                                .AsNoTracking()
                                .FirstOrDefaultAsync(m => m.Id == item.VideoId);

                            var hasCaption = mediaFile?.VideoCaptions != null &&
                                             mediaFile.VideoCaptions.Any(c => c.Status == CaptionStatus.COMPLETED);

                            if (!hasCaption)
                            {
                                issues.Add(new QualityCheckIssue
                                {
                                    Category = ReviewFeedbackCategory.VideoQuality,
                                    Severity = QualityIssueSeverity.Warning,
                                    AdminAction = QualityIssueStatus.Pending,
                                    RuleId = "CU-03",
                                    Location = $"Section: '{section.Title}' > Lecture: '{item.Title}'",
                                    Description = "Video lecture is missing a completed subtitle or caption file, reducing accessibility.",
                                    Evidence = $"Video ID: {item.VideoId}",
                                    Suggestion = "Generate captions using the AI subtitling feature or manually upload a caption file.",
                                });
                            }
                        }
                    }
                }
            }
        }

        // Quizzes
        var quizzes = await _context.Quizzes
            .Include(q => q.Questions)
            .ThenInclude(q => q.Choices)
            .Where(q => q.CourseId == course.Id)
            .AsNoTracking()
            .ToListAsync();

        foreach (var quiz in quizzes)
        {
            if (quiz.Questions.Count < 3)
            {
                issues.Add(new QualityCheckIssue
                {
                    Category = ReviewFeedbackCategory.CourseContent,
                    Severity = QualityIssueSeverity.Warning,
                    AdminAction = QualityIssueStatus.Pending,
                    RuleId = "CU-04",
                    Location = $"Quiz: '{quiz.Title}'",
                    Description = $"Quiz contains only {quiz.Questions.Count} question(s). A minimum of 3 questions is required for effective assessment.",
                    Evidence = $"Quiz: '{quiz.Title}'",
                    Suggestion = "Add more questions to provide a thorough assessment of student knowledge.",
                });
            }

            foreach (var question in quiz.Questions)
            {
                var hasCorrectChoice = question.Choices.Any(c => c.IsCorrect);
                if (!hasCorrectChoice)
                {
                    issues.Add(new QualityCheckIssue
                    {
                        Category = ReviewFeedbackCategory.CourseContent,
                        Severity = QualityIssueSeverity.Critical,
                        AdminAction = QualityIssueStatus.Pending,
                        RuleId = "CU-05",
                        Location = $"Quiz: '{quiz.Title}' > Question: '{question.Name}'",
                        Description = "This quiz question has no correct answer marked. Students cannot be assessed accurately.",
                        Evidence = $"Question: '{question.Name}'",
                        Suggestion = "Mark at least one choice as the correct answer for this question.",
                    });
                }
            }
        }

        // Assignments
        var assignments = await _context.Assignments
            .Where(a => a.CourseId == course.Id)
            .AsNoTracking()
            .ToListAsync();

        foreach (var assign in assignments)
        {
            if (string.IsNullOrWhiteSpace(assign.Instructions))
            {
                issues.Add(new QualityCheckIssue
                {
                    Category = ReviewFeedbackCategory.CourseContent,
                    Severity = QualityIssueSeverity.Warning,
                    AdminAction = QualityIssueStatus.Pending,
                    RuleId = "CU-06",
                    Location = $"Assignment: '{assign.Title}'",
                    Description = "Assignment is missing student instructions. Learners will not know how to complete the task.",
                    Evidence = $"Assignment: '{assign.Title}'",
                    Suggestion = "Add clear, detailed instructions that explain exactly what students are expected to do.",
                });
            }
        }

        return issues;
    }

    private List<string> DeserializeList(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return new List<string>();
        }
        try
        {
            return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
        }
        catch
        {
            return new List<string>();
        }
    }

    private List<SectionContentJson> ParseCurriculum(string contentJson)
    {
        if (string.IsNullOrWhiteSpace(contentJson))
        {
            return new List<SectionContentJson>();
        }
        try
        {
            var parsed = JsonSerializer.Deserialize<CourseContentJson>(contentJson,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return parsed?.Contents ?? new List<SectionContentJson>();
        }
        catch
        {
            return new List<SectionContentJson>();
        }
    }

    private static string StripHtml(string html)
    {
        if (string.IsNullOrWhiteSpace(html))
        {
            return "";
        }
        return Regex.Replace(html, @"<[^>]+>", " ")
            .Replace("&nbsp;", " ")
            .Replace("&amp;", "&")
            .Replace("&lt;", "<")
            .Replace("&gt;", ">")
            .Replace("&quot;", "\"")
            .Replace("&#39;", "'");
    }

    private ReviewFeedbackCategory MapCategory(string ruleId, string categoryStr)
    {
        if (string.IsNullOrWhiteSpace(ruleId))
        {
            return MapCategoryLegacy(categoryStr);
        }

        var normalizedRule = ruleId.ToUpperInvariant().Trim();

        if (normalizedRule == "LP-01" || normalizedRule == "LP-02" || normalizedRule == "LP-03")
        {
            return ReviewFeedbackCategory.CourseTitleSubtitle;
        }
        if (normalizedRule == "LP-04" || normalizedRule == "LP-05")
        {
            return ReviewFeedbackCategory.CourseDescription;
        }
        if (normalizedRule == "LP-06" || normalizedRule == "LP-09")
        {
            return ReviewFeedbackCategory.IntendedLearners;
        }
        if (normalizedRule == "LP-07" || normalizedRule == "LP-10")
        {
            return ReviewFeedbackCategory.CourseLandingPage;
        }
        if (normalizedRule == "LP-08")
        {
            return ReviewFeedbackCategory.CourseImage;
        }

        if (normalizedRule.StartsWith("LO-"))
        {
            if (normalizedRule == "LO-01" || normalizedRule == "LO-02" ||
                normalizedRule == "LO-03" || normalizedRule == "LO-04" ||
                normalizedRule == "LO-06")
            {
                return ReviewFeedbackCategory.IntendedLearners;
            }
            return ReviewFeedbackCategory.CourseContent;
        }

        if (normalizedRule.StartsWith("CU-"))
        {
            if (normalizedRule == "CU-03")
            {
                return ReviewFeedbackCategory.VideoQuality;
            }
            return ReviewFeedbackCategory.CourseContent;
        }

        return MapCategoryLegacy(categoryStr);
    }

    private ReviewFeedbackCategory MapCategoryLegacy(string categoryStr)
    {
        if (string.IsNullOrWhiteSpace(categoryStr))
        {
            return ReviewFeedbackCategory.Other;
        }
        var normalized = categoryStr.ToLowerInvariant();
        if (normalized.Contains("objective") || normalized.Contains("intended"))
        {
            return ReviewFeedbackCategory.IntendedLearners;
        }
        if (normalized.Contains("landing") || normalized.Contains("page"))
        {
            return ReviewFeedbackCategory.CourseLandingPage;
        }
        if (normalized.Contains("title") || normalized.Contains("subtitle"))
        {
            return ReviewFeedbackCategory.CourseTitleSubtitle;
        }
        if (normalized.Contains("description"))
        {
            return ReviewFeedbackCategory.CourseDescription;
        }
        if (normalized.Contains("image"))
        {
            return ReviewFeedbackCategory.CourseImage;
        }
        if (normalized.Contains("video"))
        {
            return ReviewFeedbackCategory.VideoQuality;
        }
        if (normalized.Contains("audio"))
        {
            return ReviewFeedbackCategory.AudioQuality;
        }
        if (normalized.Contains("policy"))
        {
            return ReviewFeedbackCategory.Policy;
        }
        if (normalized.Contains("price") || normalized.Contains("pricing"))
        {
            return ReviewFeedbackCategory.Pricing;
        }
        if (normalized.Contains("instructor"))
        {
            return ReviewFeedbackCategory.InstructorProfile;
        }
        if (normalized.Contains("content"))
        {
            return ReviewFeedbackCategory.CourseContent;
        }
        return ReviewFeedbackCategory.Other;
    }

    private QualityIssueSeverity MapSeverity(string severityStr)
    {
        if (string.IsNullOrWhiteSpace(severityStr))
        {
            return QualityIssueSeverity.Suggestion;
        }
        var normalized = severityStr.ToLowerInvariant();
        if (normalized.Contains("critical"))
        {
            return QualityIssueSeverity.Critical;
        }
        if (normalized.Contains("warning"))
        {
            return QualityIssueSeverity.Warning;
        }
        return QualityIssueSeverity.Suggestion;
    }

    private async Task<string> DownloadAndParseVttAsync(string fileUrl)
    {
        using var client = new HttpClient();
        try
        {
            var vttContent = await client.GetStringAsync(fileUrl);
            return ParseVtt(vttContent);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Failed to download VTT from {Url}: {Error}", fileUrl, ex.Message);
            return string.Empty;
        }
    }

    private static string ParseVtt(string vtt)
    {
        var lines = vtt.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        var textLines = new List<string>();
        foreach (var line in lines)
        {
            var trimmed = line.Trim();
            if (trimmed == "WEBVTT" || trimmed.Contains("-->") || string.IsNullOrEmpty(trimmed) || trimmed.StartsWith("NOTE"))
                continue;
            
            var cleanLine = Regex.Replace(trimmed, @"<[^>]+>", "");
            if (!string.IsNullOrWhiteSpace(cleanLine))
            {
                textLines.Add(cleanLine);
            }
        }
        return string.Join(" ", textLines);
    }

    private static int EstimateWordCount(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return 0;
        return text.Split((char[])null, StringSplitOptions.RemoveEmptyEntries).Length;
    }

    private Task SendProgress(string userId, int percent, string message, int reportId)
    {
        return _hub.SendAsync($"QualityCheck.Report:{userId}", new
        {
            percent,
            message,
            reportId
        });
    }

    private async Task<Dictionary<int, MediaFile>> FetchMediaCaptionsMapAsync(List<SectionContentJson> parsedContent)
    {
        var mediaIds = parsedContent
            .SelectMany(s => s.Items ?? new List<ItemContentJson>())
            .Where(i => i.GetResolvedType() == "video" && i.VideoId > 0)
            .Select(i => i.VideoId)
            .Distinct()
            .ToList();

        var mediaCaptions = await _context.MediaFiles
            .Include(m => m.VideoCaptions)
            .Where(m => mediaIds.Contains(m.Id))
            .AsNoTracking()
            .ToListAsync();

        return mediaCaptions.ToDictionary(m => m.Id);
    }

    private List<QualityCheckIssue> ParseAiIssues(string responseBody, int reportId)
    {
        var aiIssues = new List<QualityCheckIssue>();
        try
        {
            var aiResponse = JsonSerializer.Deserialize<JsonElement>(responseBody);
            if (aiResponse.TryGetProperty("issues", out var issuesEl))
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var parsedIssues = JsonSerializer.Deserialize<List<AiCheckIssueDto>>(issuesEl.GetRawText(), options);
                if (parsedIssues != null)
                {
                    foreach (var pi in parsedIssues)
                    {
                        aiIssues.Add(new QualityCheckIssue
                        {
                            ReportId = reportId,
                            Category = MapCategory(pi.RuleId, pi.Category),
                            Severity = MapSeverity(pi.Severity),
                            AdminAction = QualityIssueStatus.Pending,
                            RuleId = pi.RuleId ?? "AI-GEN",
                            Location = pi.Location ?? "",
                            Description = pi.Description ?? "",
                            Evidence = pi.Evidence ?? "",
                            Suggestion = pi.Suggestion ?? ""
                        });
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse AI Center quality check response.");
        }
        return aiIssues;
    }

    private float CalculateOverallScore(List<QualityCheckIssue> issues)
    {
        var criticalCount = issues.Count(i => i.Severity == QualityIssueSeverity.Critical);
        var warningCount = issues.Count(i => i.Severity == QualityIssueSeverity.Warning);
        var suggestionCount = issues.Count(i => i.Severity == QualityIssueSeverity.Suggestion);

        var overallScore = 100f - (criticalCount * 15f + warningCount * 5f + suggestionCount * 2f);
        return Math.Max(0f, overallScore);
    }

    //Internal JSON Mapping Classes

    private class CourseContentJson
    {
        public List<SectionContentJson> Contents { get; set; }
    }

    private class SectionContentJson
    {
        public string SectionId { get; set; }
        public string Title { get; set; }
        public string LearningObjectives { get; set; }
        public List<ItemContentJson> Items { get; set; }
    }

    private class ItemContentJson
    {
        public string ItemId { get; set; }
        public string Title { get; set; }
        public string ContentType { get; set; }
        public string Type { get; set; }
        public string Content { get; set; }
        public int VideoId { get; set; }

        public string GetResolvedType()
        {
            return (!string.IsNullOrWhiteSpace(ContentType) ? ContentType : Type)?.ToLowerInvariant() ?? "";
        }
    }

    private class AiCheckIssueDto
    {
        public string RuleId { get; set; }
        public string Category { get; set; }
        public string Severity { get; set; }
        public string Location { get; set; }
        public string Description { get; set; }
        public string Evidence { get; set; }
        public string Suggestion { get; set; }
        public string Confidence { get; set; }
    }
}
