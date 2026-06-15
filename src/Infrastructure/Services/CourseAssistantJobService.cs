using System.Text.Json;
using System.Text.RegularExpressions;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.SystemSettings.Queries.GetAIConfigQuery;
using Edunary.Infrastructure.Data;
using Hangfire;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Edunary.Infrastructure.Services;

public class CourseAssistantJobService : ICourseAssistantJobService
{
    private readonly ApplicationDbContext _context;
    private readonly ISender _sender;
    private readonly IAICenterClient _aiCenterClient;
    private readonly IAppHubService _hub;
    private readonly ILogger<CourseAssistantJobService> _logger;

    public CourseAssistantJobService(
        ApplicationDbContext context,
        ISender sender,
        IAICenterClient aiCenterClient,
        IAppHubService hub,
        ILogger<CourseAssistantJobService> logger)
    {
        _context = context;
        _sender = sender;
        _aiCenterClient = aiCenterClient;
        _hub = hub;
        _logger = logger;
    }

    public void EnqueueCourseAssistantMessage(
        string userId,
        int courseId,
        string contentId,
        string contentType,
        string mediaType,
        string contentTitle,
        string message)
    {
        BackgroundJob.Enqueue<ICourseAssistantJobService>(svc =>
            svc.ProcessCourseAssistantMessageAsync(userId, courseId, contentId, contentType, mediaType, contentTitle, message));
    }

    public async Task ProcessCourseAssistantMessageAsync(
        string userId,
        int courseId,
        string contentId,
        string contentType,
        string mediaType,
        string contentTitle,
        string message)
    {
        try
        {
            // 1. Get course details
            var courseDetails = await _context.Courses
                .Where(c => c.Id == courseId)
                .Select(c => new
                {
                    c.Title,
                    c.Subtitle,
                    c.Description,
                    c.LearningObjectives,
                    c.Requirements,
                    c.TargetAudience
                })
                .FirstOrDefaultAsync();

            if (courseDetails == null)
            {
                await SendFailureAsync(userId, courseId, contentId, "Course not found.");
                return;
            }

            var courseTitle = courseDetails.Title ?? "";
            var courseSubtitle = StripHtml(courseDetails.Subtitle ?? "");
            var courseDescription = StripHtml(courseDetails.Description ?? "");
            var courseLearningObjectives = StripHtml(courseDetails.LearningObjectives ?? "");
            var courseRequirements = StripHtml(courseDetails.Requirements ?? "");
            var courseTargetAudience = StripHtml(courseDetails.TargetAudience ?? "");

            // 3. Get AI config
            var aiConfig = await _sender.Send(new GetAIConfigQuery());

            if (string.IsNullOrEmpty(aiConfig.AICenterBaseUrl))
            {
                await SendFailureAsync(userId, courseId, contentId, "AI Center is not configured.");
                return;
            }

            // 4. Build payload for AI Center
            var payload = new
            {
                user_id = userId,
                course_id = courseId,
                course_data = new
                {
                    title = courseTitle,
                    subtitle = courseSubtitle,
                    description = courseDescription,
                    learning_objectives = courseLearningObjectives,
                    requirements = courseRequirements,
                    target_audience = courseTargetAudience
                },
                content_id = contentId,
                content_type = contentType,
                media_type = mediaType,
                content_title = contentTitle,
                message = message,
                llm_config = new
                {
                    model_name = aiConfig.LLMModelName,
                    api_key = aiConfig.LLMApiKey,
                    api_base = aiConfig.LLMBaseUrl,
                    temperature = aiConfig.LLMTemperature,
                    max_tokens = aiConfig.LLMMaxTokens
                }
            };

            var url = $"{aiConfig.AICenterBaseUrl}api/course-assistant/chat";
            var (isSuccess, body) = await _aiCenterClient.PostAsync(
                url, aiConfig.AICenterApiKey, JsonSerializer.Serialize(payload));

            if (!isSuccess)
            {
                _logger.LogError("AI Center course assistant failed: {Body}", body);
                await SendFailureAsync(userId, courseId, contentId, "AI assistant is currently unavailable.");
                return;
            }

            // 5. Deserialize response
            var aiResponse = JsonSerializer.Deserialize<JsonElement>(body);
            var reply = aiResponse.TryGetProperty("reply", out var replyProp) ? replyProp.GetString() ?? "" : "";
            var messageType = aiResponse.TryGetProperty("message_type", out var typeProp) ? typeProp.GetString() ?? "text" : "text";
            var sources = aiResponse.TryGetProperty("sources", out var sourcesProp) && sourcesProp.ValueKind == JsonValueKind.Array
                ? sourcesProp.EnumerateArray().Select(s => s.GetString() ?? "").ToList()
                : new List<string>();

            // 6. Stream response via SignalR (word-by-word)
            await StreamReplyAsync(userId, courseId, contentId, reply, sources, messageType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CourseAssistantJobService failed for userId={UserId}", userId);
            await SendFailureAsync(userId, courseId, contentId, $"An error occurred: {ex.Message}");
        }
    }

    private async Task StreamReplyAsync(
        string userId,
        int courseId,
        string contentId,
        string reply,
        List<string> sources,
        string messageType)
    {
        var eventPrefix = "CourseAssistant";

        // stream_start
        await _hub.SendAsync($"{eventPrefix}.StreamStart:{userId}", new
        {
            courseId,
            contentId
        });

        // stream_chunk — word by word
        var words = reply.Split(' ');
        for (int i = 0; i < words.Length; i++)
        {
            var chunk = words[i] + (i < words.Length - 1 ? " " : "");
            await _hub.SendAsync($"{eventPrefix}.StreamChunk:{userId}", new
            {
                courseId,
                content = chunk
            });
            await Task.Delay(20); // 20ms per word
        }

        // stream_end — full payload for persistence/sources
        await _hub.SendAsync($"{eventPrefix}.StreamEnd:{userId}", new
        {
            success = true,
            courseId,
            contentId,
            reply,
            messageType,
            sources
        });
    }

    private async Task SendFailureAsync(string userId, int courseId, string contentId, string errorMessage)
    {
        await _hub.SendAsync($"CourseAssistant.StreamEnd:{userId}", new
        {
            success = false,
            courseId,
            contentId,
            message = errorMessage
        });
    }

    private static string StripHtml(string html)
    {
        if (string.IsNullOrEmpty(html)) return "";
        return Regex.Replace(html, @"<[^>]+>", " ")
            .Replace("&nbsp;", " ")
            .Replace("&amp;", "&")
            .Replace("&lt;", "<")
            .Replace("&gt;", ">")
            .Replace("&quot;", "\"")
            .Replace("&#39;", "'");
    }
}
