using System.Text;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Edunary.Application.Common.Interfaces;
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
            await SendProgress(userId, 10, "Starting quality check...", reportId);

            var report = await _context.QualityCheckReports
                .FirstOrDefaultAsync(r => r.Id == reportId);

            if (report == null)
            {
                _logger.LogError("Report with id {ReportId} not found.", reportId);
                return;
            }

            var course = await _context.Courses
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course == null)
            {
                report.Status = QualityCheckStatus.Failed;
                await _context.SaveChangesAsync(default);
                await SendProgress(userId, -1, "Course not found.", reportId);
                return;
            }

            await SendProgress(userId, 25, "Running pre-flight checks...", reportId);

            // 1. Run pre-flight checks
            var preFlightIssues = await RunPreFlightChecksAsync(course);

            await SendProgress(userId, 50, "Calling AI Quality Analyzer...", reportId);

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
            
            var mediaCaptionsMap = mediaCaptions.ToDictionary(m => m.Id);

            // 4. Construct plain text for each section and group them into batches
            var sectionTexts = new List<(string SectionTitle, string Text)>();

            foreach (var section in parsedContent)
            {
                var sb = new StringBuilder();
                sb.AppendLine($"# Section: {section.Title}");
                if (!string.IsNullOrWhiteSpace(section.LearningObjectives))
                {
                    sb.AppendLine($"* Objectives: {section.LearningObjectives}");
                }
                sb.AppendLine();

                if (section.Items != null)
                {
                    foreach (var item in section.Items)
                    {
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
                                    else
                                    {
                                        sb.AppendLine("[Caption file was empty or failed to parse]");
                                    }
                                }
                                else
                                {
                                    sb.AppendLine("[No completed subtitle/caption file available]");
                                }
                            }
                            else
                            {
                                sb.AppendLine("[No video media file metadata found]");
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
                                sb.AppendLine($"* Description: {StripHtml(quiz.Description)}");
                                sb.AppendLine("Questions:");
                                foreach (var q in quiz.Questions)
                                {
                                    sb.AppendLine($"- Question: {StripHtml(q.Name)} ({q.Type})");
                                    sb.AppendLine("  Choices:");
                                    foreach (var choice in q.Choices)
                                    {
                                        sb.AppendLine($"    * {StripHtml(choice.Text)} (Correct: {choice.IsCorrect})");
                                    }
                                }
                            }
                            else
                            {
                                sb.AppendLine("[Quiz data not found]");
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
                                sb.AppendLine($"* Description: {StripHtml(assign.Description)}");
                                sb.AppendLine($"* Instructions: {StripHtml(assign.Instructions)}");
                                if (assign.Questions != null && assign.Questions.Any())
                                {
                                    sb.AppendLine("Questions:");
                                    foreach (var q in assign.Questions)
                                    {
                                        sb.AppendLine($"- {StripHtml(q.QuestionText)}");
                                    }
                                }
                            }
                            else
                            {
                                sb.AppendLine("[Assignment data not found]");
                            }
                            sb.AppendLine();
                        }
                    }
                }
                
                sectionTexts.Add((section.Title ?? "Untitled Section", sb.ToString()));
            }

            var contentBatches = new List<object>();
            var currentBatchSections = new List<string>();
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
                        content_text = currentBatchText.ToString()
                    });

                    currentBatchSections.Clear();
                    currentBatchText.Clear();
                    currentBatchWordCount = 0;
                }

                currentBatchSections.Add(sec.SectionTitle);
                currentBatchText.AppendLine(sec.Text);
                currentBatchWordCount += secWordCount;

                if (currentBatchWordCount >= 6000)
                {
                    contentBatches.Add(new
                    {
                        batch_index = batchIndex++,
                        sections = currentBatchSections.ToList(),
                        content_text = currentBatchText.ToString()
                    });

                    currentBatchSections.Clear();
                    currentBatchText.Clear();
                    currentBatchWordCount = 0;
                }
            }

            if (currentBatchSections.Any())
            {
                contentBatches.Add(new
                {
                    batch_index = batchIndex++,
                    sections = currentBatchSections,
                    content_text = currentBatchText.ToString()
                });
            }

            // 5. Build curriculum tree representation for metadata rules
            var curriculum = parsedContent
                .Select(s => new
                {
                    section_title = s.Title ?? "",
                    learning_objectives = s.LearningObjectives ?? "",
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
                }
            };

            //var payloadJson = JsonSerializer.Serialize(payload, new JsonSerializerOptions
            //{
            //    WriteIndented = true
            //});

            //await System.IO.File.WriteAllTextAsync("payload_debug.json", payloadJson);

            var url = $"{aiConfig.AICenterBaseUrl}api/quality-check/analyze";
            var (isSuccess, body) = await _aiCenterClient.PostAsync(
                url, aiConfig.AICenterApiKey, JsonSerializer.Serialize(payload));

            List<QualityCheckIssue> aiIssues = new List<QualityCheckIssue>();
            string analysisSummary = "Quality check finished.";

            if (isSuccess)
            {
                try
                {
                    var aiResponse = JsonSerializer.Deserialize<JsonElement>(body);
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
                                    Category = MapCategory(pi.Category),
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

                    if (aiResponse.TryGetProperty("analysis_summary", out var summaryEl))
                    {
                        analysisSummary = summaryEl.GetString() ?? analysisSummary;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to parse AI Center quality check response.");
                }
            }
            else
            {
                _logger.LogWarning("AI Center request failed: {Body}. Pre-flight results only.", body);
                analysisSummary = $"AI analysis failed: {body}. Showing pre-flight checks only.";
            }

            await SendProgress(userId, 80, "Calculating scores and finalizing...", reportId);

            // 4. Merge issues
            var allIssues = new List<QualityCheckIssue>();
            foreach (var issue in preFlightIssues)
            {
                issue.ReportId = reportId;
                allIssues.Add(issue);
            }
            allIssues.AddRange(aiIssues);

            // 5. Save all issues to database
            foreach (var issue in allIssues)
            {
                _context.QualityCheckIssues.Add(issue);
            }

            // 6. Calculate deterministic score
            var criticalCount = allIssues.Count(i => i.Severity == QualityIssueSeverity.Critical);
            var warningCount = allIssues.Count(i => i.Severity == QualityIssueSeverity.Warning);
            var suggestionCount = allIssues.Count(i => i.Severity == QualityIssueSeverity.Suggestion);

            var overallScore = 100f - (criticalCount * 15f + warningCount * 5f + suggestionCount * 2f);
            if (overallScore < 0)
            {
                overallScore = 0;
            }

            // 7. Update current report status
            report.Status = QualityCheckStatus.Completed;
            report.OverallScore = overallScore;
            report.AnalysisSummary = analysisSummary;

            await _context.SaveChangesAsync(default);

            await SendProgress(userId, 100, "Quality check completed successfully!", reportId);
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
            catch (Exception dbEx)
            {
                _logger.LogError(dbEx, "Failed to save failed status to report.");
            }
            await SendProgress(userId, -1, $"Quality check failed: {ex.Message}", reportId);
        }
    }

    private async Task<List<QualityCheckIssue>> RunPreFlightChecksAsync(Course course)
    {
        var issues = new List<QualityCheckIssue>();

        // Title length
        var titleLen = course.Title?.Length ?? 0;
        if (titleLen < 5 || titleLen > 80)
        {
            issues.Add(new QualityCheckIssue
            {
                Category = ReviewFeedbackCategory.CourseTitleSubtitle,
                Severity = QualityIssueSeverity.Warning,
                AdminAction = QualityIssueStatus.Pending,
                RuleId = "PF-TITLE-LEN",
                Location = "Course Title",
                Description = $"Course title must be between 5 and 80 characters. Current length: {titleLen}.",
                Evidence = course.Title ?? "",
                Suggestion = "Adjust the title length to be within 5-80 characters.",
            });
        }

        // Description word count
        var desc = course.Description ?? "";
        var descWords = string.IsNullOrWhiteSpace(desc) ? 0 : Regex.Split(desc.Trim(), @"\s+").Length;
        if (descWords < 200)
        {
            issues.Add(new QualityCheckIssue
            {
                Category = ReviewFeedbackCategory.CourseDescription,
                Severity = QualityIssueSeverity.Warning,
                AdminAction = QualityIssueStatus.Pending,
                RuleId = "PF-DESC-LEN",
                Location = "Course Description",
                Description = $"Course description is too short ({descWords} words). Recommended minimum is 200 words.",
                Evidence = desc.Length > 200 ? desc.Substring(0, 200) + "..." : desc,
                Suggestion = "Add more detailed information about what students will learn and achieve.",
            });
        }

        // Missing cover image
        if (string.IsNullOrWhiteSpace(course.ImageUrl))
        {
            issues.Add(new QualityCheckIssue
            {
                Category = ReviewFeedbackCategory.CourseImage,
                Severity = QualityIssueSeverity.Warning,
                AdminAction = QualityIssueStatus.Pending,
                RuleId = "PF-IMAGE-MISSING",
                Location = "Course Cover Image",
                Description = "Course cover image is missing.",
                Evidence = "",
                Suggestion = "Upload a cover image to make the course appealing on the marketplace."
            });
        }

        // Intended learners: Learning objectives count
        var loList = DeserializeList(course.LearningObjectives);
        if (loList.Count < 3 || loList.Count > 10)
        {
            issues.Add(new QualityCheckIssue
            {
                Category = ReviewFeedbackCategory.IntendedLearners,
                Severity = QualityIssueSeverity.Warning,
                AdminAction = QualityIssueStatus.Pending,
                RuleId = "PF-LO-COUNT",
                Location = "Learning Objectives",
                Description = $"Course should have between 3 and 10 learning objectives. Current count: {loList.Count}.",
                Evidence = $"Count: {loList.Count}",
                Suggestion = "Ensure you specify at least 3 and at most 10 distinct learning outcomes.",
            });
        }

        // Requirements missing
        var reqList = DeserializeList(course.Requirements);
        if (reqList.Count == 0)
        {
            issues.Add(new QualityCheckIssue
            {
                Category = ReviewFeedbackCategory.IntendedLearners,
                Severity = QualityIssueSeverity.Warning,
                AdminAction = QualityIssueStatus.Pending,
                RuleId = "PF-REQ-MISSING",
                Location = "Course Requirements",
                Description = "Requirements list is empty.",
                Evidence = "",
                Suggestion = "List any requirements or prerequisites for students before starting this course.",
            });
        }

        // Target audience missing
        var audList = DeserializeList(course.TargetAudience);
        if (audList.Count == 0)
        {
            issues.Add(new QualityCheckIssue
            {
                Category = ReviewFeedbackCategory.IntendedLearners,
                Severity = QualityIssueSeverity.Warning,
                AdminAction = QualityIssueStatus.Pending,
                RuleId = "PF-AUDIENCE-MISSING",
                Location = "Target Audience",
                Description = "Target audience list is empty.",
                Evidence = "",
                Suggestion = "Define the target audience so students know if the course is right for them.",
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
                RuleId = "PF-CURRICULUM-MIN",
                Location = "Curriculum Structure",
                Description = $"Course structure is too small. Got {sectionsCount} sections and {totalLectures} lectures. Minimum required: 2 sections and 5 lectures.",
                Evidence = $"Sections: {sectionsCount}, Lectures: {totalLectures}",
                Suggestion = "Add more structured sections and instructional lectures.",
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
                                    RuleId = "PF-ARTICLE-LEN",
                                    Location = $"Section: '{section.Title}' > Lecture: '{item.Title}'",
                                    Description = $"Article lecture is too short. Contains only {words} words. Recommended minimum is 200 words.",
                                    Evidence = $"Lecture: '{item.Title}'",
                                    Suggestion = "Provide more detailed study material and context for this lecture.",
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
                                    RuleId = "PF-VIDEO-NO-CAPTION",
                                    Location = $"Section: '{section.Title}' > Lecture: '{item.Title}'",
                                    Description = "Video lecture has no completed subtitle/caption file.",
                                    Evidence = $"Video ID: {item.VideoId}",
                                    Suggestion = "Generate subtitles using AI or upload captions for accessibility.",
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
                    RuleId = "PF-QUIZ-MIN-QUESTIONS",
                    Location = $"Quiz: '{quiz.Title}'",
                    Description = $"Quiz has only {quiz.Questions.Count} questions. Recommended minimum is 3 questions.",
                    Evidence = $"Quiz Title: {quiz.Title}",
                    Suggestion = "Add more assessment questions to test student knowledge.",
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
                        RuleId = "PF-QUIZ-NO-CORRECT-ANSWER",
                        Location = $"Quiz: '{quiz.Title}' > Question: '{question.Name}'",
                        Description = "Quiz question does not have a designated correct answer.",
                        Evidence = $"Question: {question.Name}",
                        Suggestion = "Select at least one correct choice for this question.",
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
                    RuleId = "PF-ASSIGNMENT-NO-INSTRUCTIONS",
                    Location = $"Assignment: '{assign.Title}'",
                    Description = "Assignment is missing student guidelines/instructions.",
                    Evidence = $"Assignment: {assign.Title}",
                    Suggestion = "Fill in detailed instructions explaining how students should perform the task.",
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

    private ReviewFeedbackCategory MapCategory(string categoryStr)
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

    //Internal JSON Mapping Classes

    private class CourseContentJson
    {
        public List<SectionContentJson> Contents { get; set; }
    }

    private class SectionContentJson
    {
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
