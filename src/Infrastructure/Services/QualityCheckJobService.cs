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

            // 3. Prepare curriculum structure metadata
            var curriculum = ParseCurriculum(course.Content)
                .Select(s => new
                {
                    section_title = s.Title ?? "",
                    learning_objectives = s.LearningObjectives ?? "",
                    items = s.Items?.Select(i => (object)new
                    {
                        title = i.Title ?? "",
                        content_type = i.ContentType ?? ""
                    }).ToList() ?? new List<object>()
                }).ToList();

            var payload = new
            {
                course_id = course.Id,
                course_title = course.Title ?? "",
                course_subtitle = course.Subtitle ?? "",
                course_description = course.Description ?? "",
                learning_objectives = DeserializeList(course.LearningObjectives),
                requirements = DeserializeList(course.Requirements),
                target_audience = DeserializeList(course.TargetAudience),
                curriculum,
                llm_config = new
                {
                    model_name = aiConfig.LLMModelName,
                    api_key = aiConfig.LLMApiKey,
                    api_base = aiConfig.LLMBaseUrl,
                    temperature = 0.2,
                    max_tokens = aiConfig.LLMMaxTokens
                }
            };

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
        var totalLectures = parsedContent?.Sum(s => s.Items?.Count(i => i.ContentType == "article" || i.ContentType == "video") ?? 0) ?? 0;

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
                        if (item.ContentType == "article")
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
                        else if (item.ContentType == "video" && item.VideoId > 0)
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

    private Dictionary<string, float> CalculateCategoryScores(List<QualityCheckIssue> issues)
    {
        var categories = new[]
        {
            "LearningObjectives", // IntendedLearners
            "LandingPage",        // CourseLandingPage, CourseTitleSubtitle, CourseDescription, CourseImage
            "CourseContent",      // CourseContent, VideoQuality, AudioQuality
            "Policy"              // Policy
        };

        var scoreDict = new Dictionary<string, float>();

        foreach (var cat in categories)
        {
            List<QualityCheckIssue> catIssues;

            if (cat == "LearningObjectives")
            {
                catIssues = issues.Where(i => i.Category == ReviewFeedbackCategory.IntendedLearners).ToList();
            }
            else if (cat == "LandingPage")
            {
                catIssues = issues.Where(i => i.Category == ReviewFeedbackCategory.CourseLandingPage ||
                                              i.Category == ReviewFeedbackCategory.CourseTitleSubtitle ||
                                              i.Category == ReviewFeedbackCategory.CourseDescription ||
                                              i.Category == ReviewFeedbackCategory.CourseImage).ToList();
            }
            else if (cat == "CourseContent")
            {
                catIssues = issues.Where(i => i.Category == ReviewFeedbackCategory.CourseContent ||
                                              i.Category == ReviewFeedbackCategory.VideoQuality ||
                                              i.Category == ReviewFeedbackCategory.AudioQuality).ToList();
            }
            else
            {
                catIssues = issues.Where(i => i.Category == ReviewFeedbackCategory.Policy).ToList();
            }

            var critical = catIssues.Count(i => i.Severity == QualityIssueSeverity.Critical);
            var warning = catIssues.Count(i => i.Severity == QualityIssueSeverity.Warning);
            var suggestion = catIssues.Count(i => i.Severity == QualityIssueSeverity.Suggestion);

            var catScore = 100f - (critical * 15f + warning * 5f + suggestion * 2f);
            if (catScore < 0)
            {
                catScore = 0;
            }
            scoreDict[cat] = catScore;
        }

        return scoreDict;
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
        public string Content { get; set; }
        public int VideoId { get; set; }
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
