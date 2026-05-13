using System.Net.Http;
using System.Text;
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

public class QuizGenerationJobService : IQuizGenerationJobService
{
    private readonly ApplicationDbContext _context;
    private readonly ISender _sender;
    private readonly IAICenterClient _aiCenterClient;
    private readonly IAppHubService _hub;
    private readonly INotifyService _notifyService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ICaptionGenerationJobService _captionJobService;
    private readonly ILogger<QuizGenerationJobService> _logger;

    public QuizGenerationJobService(
        ApplicationDbContext context,
        ISender sender,
        IAICenterClient aiCenterClient,
        IAppHubService hub,
        INotifyService notifyService,
        IHttpClientFactory httpClientFactory,
        ICaptionGenerationJobService captionJobService,
        ILogger<QuizGenerationJobService> logger)
    {
        _context = context;
        _sender = sender;
        _aiCenterClient = aiCenterClient;
        _hub = hub;
        _notifyService = notifyService;
        _httpClientFactory = httpClientFactory;
        _captionJobService = captionJobService;
        _logger = logger;
    }

    public void EnqueueQuizGeneration(
        string userId, int courseId, string itemId, string relatedItemId,
        int numQuestions, List<string> questionTypes, string difficulty, string promptDescription)
    {
        BackgroundJob.Enqueue<IQuizGenerationJobService>(svc =>
            svc.ProcessQuizGenerationAsync(userId, courseId, itemId, relatedItemId,
                numQuestions, questionTypes, difficulty, promptDescription));
    }

    public async Task ProcessQuizGenerationAsync(
        string userId, int courseId, string itemId, string relatedItemId,
        int numQuestions, List<string> questionTypes, string difficulty, string promptDescription)
    {
        try
        {
            await SendProgress(userId, 10, "Extracting lecture content...");
            await Task.Delay(900);

            // 1. Load course (with content JSON)
            var course = await _context.Courses
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course == null)
            {
                await SendProgress(userId, -1, "Course not found.");
                return;
            }

            // 2. Parse course content JSON to find section + lecture item
            var (lectureContent, videoFileUrl, lectureTitle, sectionObjectives, videoId) =
                await ExtractLectureContentAsync(course, relatedItemId);

            if (string.IsNullOrWhiteSpace(lectureContent) && string.IsNullOrWhiteSpace(videoFileUrl))
            {
                await SendProgress(userId, -1,
                    "No content found for this lecture. " +
                    "Add article content or video captions, or use the Prompt Description field.");
                return;
            }

            // No caption exists for this video — transcribe first so Whisper is called only once
            // and the source transcript is saved for all future quiz/caption operations.
            if (string.IsNullOrWhiteSpace(lectureContent) && !string.IsNullOrWhiteSpace(videoFileUrl) && videoId > 0)
            {
                await SendProgress(userId, 15, "No caption found — transcribing video first...");
                await _captionJobService.ProcessCaptionGenerationAsync(userId, videoId, null);

                // Re-read the newly saved source transcript
                var saved = await _context.VideoCaptions
                    .AsNoTracking()
                    .Where(c => c.MediaFileId == videoId && c.IsSourceTranscript && c.Status == CaptionStatus.COMPLETED)
                    .FirstOrDefaultAsync();

                if (saved != null && !string.IsNullOrEmpty(saved.FileUrl))
                {
                    lectureContent = await DownloadAndParseVttAsync(saved.FileUrl);
                    videoFileUrl = string.Empty; // quiz endpoint no longer needs to call Whisper
                }
                // if transcription failed, fall through — AI Center will attempt Whisper as last resort
            }

            await SendProgress(userId, 25, "Analyzing learning objectives...");
            await Task.Delay(900);

            // 3. Get AI config (includes STT config)
            var aiConfig = await _sender.Send(new GetAIConfigQuery());

            // 4. Build payload for AI Center
            var payload = new
            {
                lecture_content = lectureContent,
                video_file_url = videoFileUrl,
                lecture_title = lectureTitle,
                course_title = course.Title,
                learning_objectives = new
                {
                    course_level = course.LearningObjectives ?? "",
                    section_level = sectionObjectives ?? ""
                },
                quiz_config = new
                {
                    num_questions = numQuestions,
                    question_types = questionTypes,
                    difficulty,
                    prompt_description = promptDescription
                },
                llm_config = new
                {
                    model_name = aiConfig.LLMModelName,
                    api_key = aiConfig.LLMApiKey,
                    api_base = aiConfig.LLMBaseUrl,
                    temperature = aiConfig.LLMTemperature,
                    max_tokens = aiConfig.LLMMaxTokens
                },
                stt_config = new
                {
                    api_key = aiConfig.STTApiKey,
                    model_name = aiConfig.STTModelName
                }
            };

            await SendProgress(userId, 40, "AI is generating your quiz questions...");

            var url = $"{aiConfig.AICenterBaseUrl}api/quiz/generate";
            var (isSuccess, body) = await _aiCenterClient.PostAsync(
                url, aiConfig.AICenterApiKey, JsonSerializer.Serialize(payload));

            if (!isSuccess)
            {
                _logger.LogError("AI Center quiz generation failed: {Body}", body);
                // Try to extract the specific error message from AI Center response
                var errorMessage = "Quiz generation failed. Please try again.";
                try
                {
                    var errJson = JsonSerializer.Deserialize<JsonElement>(body);
                    if (errJson.TryGetProperty("message", out var msgEl) && msgEl.GetString() is { } msg && !string.IsNullOrWhiteSpace(msg))
                        errorMessage = msg;
                    else if (errJson.TryGetProperty("detail", out var detailEl) && detailEl.GetString() is { } detail && !string.IsNullOrWhiteSpace(detail))
                        errorMessage = detail;
                }
                catch { /* ignore parse errors, use default message */ }

                await SendProgress(userId, -1, errorMessage);
                return;
            }

            await SendProgress(userId, 80, "Validating generated questions...");
            await Task.Delay(1200);

            // 5. Parse AI response
            var aiResponse = JsonSerializer.Deserialize<JsonElement>(body);
            var data = aiResponse.GetProperty("data");
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var questions = JsonSerializer.Deserialize<List<GeneratedQuestionItem>>(
                data.GetProperty("questions").GetRawText(), options) ?? new();
            var contentSummary = data.TryGetProperty("content_summary", out var summaryEl)
                ? summaryEl.GetString() ?? ""
                : "";

            if (questions.Count == 0)
            {
                await SendProgress(userId, -1, "AI could not generate valid questions. Please try again with different settings.");
                return;
            }

            _logger.LogInformation("Quiz generation complete: {Count} questions for userId={UserId}", questions.Count, userId);

            // 6. Deliver result via SignalR
            await _hub.SendAsync($"Quiz.Generate:{userId}", new
            {
                percent = 100,
                message = $"Generated {questions.Count} questions successfully!",
                questions,
                contentSummary
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "QuizGenerationJobService failed for userId={UserId}", userId);
            await SendProgress(userId, -1, $"An error occurred: {ex.Message}");
        }
    }

    // ── Content Extraction ────────────────────────────────────────────────────

    private async Task<(string lectureContent, string videoFileUrl, string lectureTitle, string sectionObjectives, int videoId)>
        ExtractLectureContentAsync(Course course, string relatedItemId)
    {
        if (string.IsNullOrEmpty(course.Content))
            return ("", "", "", "", 0);

#nullable enable
        CourseContentJson parsed;
#nullable disable
        try
        {
            parsed = JsonSerializer.Deserialize<CourseContentJson>(course.Content,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new CourseContentJson();
        }
        catch
        {
            return ("", "", "", "", 0);
        }

        if (parsed?.Contents == null)
            return ("", "", "", "", 0);

        foreach (var section in parsed.Contents)
        {
            var item = section.Items?.FirstOrDefault(i => i.ItemId == relatedItemId);
            if (item == null) continue;

            string sectionObjectives = section.LearningObjectives ?? "";
            string lectureTitle = item.Title ?? "";

            // Article content
            if (item.ContentType == "article" && !string.IsNullOrWhiteSpace(item.Content))
            {
                string plainText = StripHtml(item.Content);
                return (plainText, "", lectureTitle, sectionObjectives, 0);
            }

            // Video — caption priority
            if (item.VideoId > 0)
            {
                var mediaFile = await _context.Set<MediaFile>()
                    .Include(m => m.VideoCaptions)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(m => m.Id == item.VideoId);

                if (mediaFile != null)
                {
                    // Prefer source transcript (most accurate, already plain text from Whisper)
                    // then English caption, then any other completed user-facing caption
                    var sourceTranscript = mediaFile.VideoCaptions
                        .FirstOrDefault(c => c.IsSourceTranscript && c.Status == CaptionStatus.COMPLETED);

                    if (sourceTranscript != null && !string.IsNullOrEmpty(sourceTranscript.FileUrl))
                    {
                        string sourceText = await DownloadAndParseVttAsync(sourceTranscript.FileUrl);
                        if (!string.IsNullOrWhiteSpace(sourceText))
                        {
                            _logger.LogInformation("Using source transcript for video {VideoId}", item.VideoId);
                            return (sourceText, "", lectureTitle, sectionObjectives, item.VideoId);
                        }
                    }

                    // Fallback: prefer English caption, then any available user-facing caption
                    var caption = mediaFile.VideoCaptions
                        .Where(c => c.Status == CaptionStatus.COMPLETED && !c.IsSourceTranscript)
                        .OrderByDescending(c => c.Language == Languages.English ? 1 : 0)
                        .FirstOrDefault();

                    if (caption != null && !string.IsNullOrEmpty(caption.FileUrl))
                    {
                        string vttText = await DownloadAndParseVttAsync(caption.FileUrl);
                        if (!string.IsNullOrWhiteSpace(vttText))
                            return (vttText, "", lectureTitle, sectionObjectives, item.VideoId);
                    }

                    // No usable caption — send video URL for Whisper STT
                    if (!string.IsNullOrEmpty(mediaFile.FileUrl))
                    {
                        _logger.LogInformation("No caption found for video {VideoId} — using Whisper STT", item.VideoId);
                        return ("", mediaFile.FileUrl, lectureTitle, sectionObjectives, item.VideoId);
                    }
                }
            }

            return ("", "", lectureTitle, sectionObjectives, 0);
        }

        return ("", "", "", "", 0);
    }

    private async Task<string> DownloadAndParseVttAsync(string fileUrl)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            var vttContent = await client.GetStringAsync(fileUrl);
            return ParseVtt(vttContent);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Failed to download VTT from {Url}: {Error}", fileUrl, ex.Message);
            return "";
        }
    }

    /// <summary>Parse WebVTT content to plain text, stripping timestamps and tags.</summary>
    private static string ParseVtt(string vtt)
    {
        var lines = vtt.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        var textLines = new List<string>();

        foreach (var line in lines)
        {
            var trimmed = line.Trim();
            // Skip header, timestamps, cue identifiers, and empty lines
            if (trimmed == "WEBVTT" || trimmed.Contains("-->") || string.IsNullOrEmpty(trimmed))
                continue;
            if (Regex.IsMatch(trimmed, @"^\d+$")) // Cue number
                continue;

            // Strip inline tags like <c>, <b>, <i>, timestamps like <00:00:01.000>
            var cleaned = Regex.Replace(trimmed, @"<[^>]+>", "").Trim();
            if (!string.IsNullOrEmpty(cleaned))
                textLines.Add(cleaned);
        }

        return string.Join(" ", textLines);
    }

    private static string StripHtml(string html)
    {
        return Regex.Replace(html, @"<[^>]+>", " ")
            .Replace("&nbsp;", " ")
            .Replace("&amp;", "&")
            .Replace("&lt;", "<")
            .Replace("&gt;", ">")
            .Replace("&quot;", "\"")
            .Replace("&#39;", "'");
    }

    private Task SendProgress(string userId, int percent, string message)
        => _hub.SendAsync($"Quiz.Generate:{userId}", new { percent, message, questions = (object)null });

    // ── Internal DTOs for course content JSON parsing ─────────────────────────

    private class CourseContentJson
    {
#nullable enable
        public List<SectionContentJson>? Contents { get; set; }
#nullable disable
    }

    private class SectionContentJson
    {
#nullable enable
        public string? LearningObjectives { get; set; }
        public List<ItemContentJson>? Items { get; set; }
#nullable disable
    }

    private class ItemContentJson
    {
#nullable enable
        public string? ItemId { get; set; }
        public string? Title { get; set; }
        public string? ContentType { get; set; }
        public string? Content { get; set; }
#nullable disable
        public int VideoId { get; set; }
    }
}

// ── Response DTOs (matches AI Center GeneratedQuestion schema) ────────────────

public class GeneratedQuestionItem
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    [JsonPropertyName("sort_order")]
    public int SortOrder { get; set; }
    public List<GeneratedChoiceItem> Choices { get; set; } = new();
}

public class GeneratedChoiceItem
{
    public string Text { get; set; } = string.Empty;
    [JsonPropertyName("is_correct")]
    public bool IsCorrect { get; set; }
    [JsonPropertyName("sort_order")]
    public int SortOrder { get; set; }
}
