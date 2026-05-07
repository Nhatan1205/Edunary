using System.Text.Json;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Roadmaps.Models;
using Edunary.Application.SystemSettings.Queries.GetAIConfigQuery;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Hangfire;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Edunary.Infrastructure.Services;

public class RoadmapJobService : IRoadmapJobService
{
    private readonly IApplicationDbContext _context;
    private readonly ISender _sender;
    private readonly IAICenterClient _aiCenterClient;
    private readonly IAppHubService _hub;
    private readonly INotifyService _notifyService;
    private readonly ILogger<RoadmapJobService> _logger;

    public RoadmapJobService(
        IApplicationDbContext context,
        ISender sender,
        IAICenterClient aiCenterClient,
        IAppHubService hub,
        INotifyService notifyService,
        ILogger<RoadmapJobService> logger)
    {
        _context = context;
        _sender = sender;
        _aiCenterClient = aiCenterClient;
        _hub = hub;
        _notifyService = notifyService;
        _logger = logger;
    }

    public void EnqueueRoadmapGeneration(string userId, string description, int roadmapTopicId)
    {
        BackgroundJob.Enqueue<IRoadmapJobService>(
            svc => svc.ProcessRoadmapGenerationAsync(userId, description, roadmapTopicId));
    }

    public async Task ProcessRoadmapGenerationAsync(string userId, string description, int roadmapTopicId)
    {
        try
        {
            await SendProgress(userId, 10, "Analyzing your learning profile...");
            await Task.Delay(900);

            // 1. Get LearnerProfile
            var profile = await _context.LearnerProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.StudentId == userId);

            List<int> preferredCategoryIds = profile != null && !string.IsNullOrEmpty(profile.PreferredCategoryIds)
                ? JsonSerializer.Deserialize<List<int>>(profile.PreferredCategoryIds) ?? new()
                : new();

            List<int> preferredTopicIds = profile != null && !string.IsNullOrEmpty(profile.PreferredTopicIds)
                ? JsonSerializer.Deserialize<List<int>>(profile.PreferredTopicIds) ?? new()
                : new();

            CourseLevel skillLevel;
            if (!Enum.TryParse<CourseLevel>(profile?.SkillLevel, out skillLevel))
                skillLevel = CourseLevel.All;

            // 2. Get enrolled IDs
            var enrolledIds = await _context.Enrollments
                .Where(e => e.StudentId == userId)
                .Select(e => e.CourseId)
                .ToListAsync();

            // 3. Resolve names
            var preferredTopicNames = preferredTopicIds.Count > 0
                ? await _context.Topics.Where(t => preferredTopicIds.Contains(t.Id)).Select(t => t.Name).ToListAsync()
                : new List<string>();

            var preferredCategoryNames = preferredCategoryIds.Count > 0
                ? await _context.Categories.Where(c => preferredCategoryIds.Contains(c.Id)).Select(c => c.Title).ToListAsync()
                : new List<string>();

            var roadmapTopicName = await _context.RoadmapTopics
                .Where(t => t.Id == roadmapTopicId)
                .Select(t => t.Title)
                .FirstOrDefaultAsync() ?? string.Empty;

            await SendProgress(userId, 25, "Understanding your current skills...");
            await Task.Delay(900);

            // 4. Get AI config
            var aiConfig = await _sender.Send(new GetAIConfigQuery());

            // 5. Build payload
            var payload = new
            {
                student_profile = new
                {
                    skill_level = skillLevel.ToString(),
                    goal = profile?.Goal,
                    preferred_topics = preferredTopicNames,
                    preferred_categories = preferredCategoryNames,
                    weekly_hours = profile?.WeeklyHours,
                    enrolled_course_ids = enrolledIds,
                },
                roadmap_data = new
                {
                    description,
                    roadmap_topic = roadmapTopicName,
                },
                llm_config = new
                {
                    model_name = aiConfig.LLMModelName,
                    api_key = aiConfig.LLMApiKey,
                    api_base = aiConfig.LLMBaseUrl,
                    temperature = aiConfig.LLMTemperature,
                    max_tokens = aiConfig.LLMMaxTokens
                }
            };

            var url = $"{aiConfig.AICenterBaseUrl}api/roadmap/generate";

            await SendProgress(userId, 50, "AI is designing your personalized roadmap...");

            var (isSuccess, body) = await _aiCenterClient.PostAsync(url, aiConfig.AICenterApiKey, JsonSerializer.Serialize(payload));

            if (!isSuccess)
            {
                _logger.LogError("AI Center generate failed: {Body}", body);
                await SendProgress(userId, -1, "AI roadmap generation failed. Please try again.");
                return;
            }

            await SendProgress(userId, 80, "Validating and optimizing results...");
            await Task.Delay(1200);

            // 6. Parse response
            var aiResponse = JsonSerializer.Deserialize<JsonElement>(body);
            var data = aiResponse.GetProperty("data");
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

            var nodes = JsonSerializer.Deserialize<List<RoadmapNodeData>>(data.GetProperty("nodes").GetRawText(), options) ?? new();
            var edges = JsonSerializer.Deserialize<List<RoadmapEdgeData>>(data.GetProperty("edges").GetRawText(), options) ?? new();

            // 7. Hallucination guard
            HashSet<int> validCourseIds;
            if (data.TryGetProperty("searched_course_ids", out var searchedIdsEl))
            {
                var searchedIds = JsonSerializer.Deserialize<List<int>>(searchedIdsEl.GetRawText(), options) ?? new();
                validCourseIds = searchedIds.ToHashSet();
            }
            else
            {
                validCourseIds = nodes.Select(n => n.CourseId).ToHashSet();
                _logger.LogWarning("AI Center response missing searched_course_ids — skipping hallucination check.");
            }

            var invalidNodeIds = nodes.Where(n => !validCourseIds.Contains(n.CourseId)).Select(n => n.ClientNodeId).ToHashSet();
            if (invalidNodeIds.Count > 0)
            {
                _logger.LogWarning("Stripping {Count} hallucinated node(s).", invalidNodeIds.Count);
                nodes = nodes.Where(n => validCourseIds.Contains(n.CourseId)).ToList();
                edges = edges.Where(e => !invalidNodeIds.Contains(e.SourceNodeId) && !invalidNodeIds.Contains(e.TargetNodeId)).ToList();
            }

            if (nodes.Count == 0)
            {
                await SendProgress(userId, -1, "AI could not generate a valid roadmap for your profile. Please try a different goal or topic.");
                return;
            }

            // 8. Save roadmap
            var aiSummary = data.TryGetProperty("summary", out var summaryEl) ? summaryEl.GetString() : null;
            var finalDescription = !string.IsNullOrWhiteSpace(aiSummary) ? aiSummary : description;

            var roadmap = new Roadmap
            {
                CreatedBy = userId,
                Title = $"{roadmapTopicName} Career Path",
                Subtitle = $"Personalized {skillLevel} path · {roadmapTopicName}",
                Description = finalDescription,
                Level = skillLevel,
                IsPublic = false,
                RoadmapTopicId = roadmapTopicId,
                GraphData = JsonSerializer.Serialize(new RoadmapGraphData { Nodes = nodes, Edges = edges }),
                Source = RoadmapSource.AIGenerated,
            };

            _context.Roadmaps.Add(roadmap);
            await _context.SaveChangesAsync(default);

            await _hub.SendAsync($"Roadmap.Progress:{userId}", new
            {
                percent = 100,
                message = "Your career path is ready!",
                roadmapId = roadmap.Id
            });


            await _notifyService.NotifyUserAsync(
                userId,
                title: "Career Path Ready",
                message: $"Your personalized \"{roadmap.Title}\" career path has been generated successfully.",
                type: "roadmap",
                payload: new { roadmapId = roadmap.Id });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "RoadmapJobService.ProcessRoadmapGenerationAsync failed for userId={UserId}", userId);
            await SendProgress(userId, -1, $"An error occurred: {ex.Message}");
        }
    }

    private Task SendProgress(string userId, int percent, string message)
    {
        return _hub.SendAsync($"Roadmap.Progress:{userId}", new { percent, message, roadmapId = (int?)null });
    }
}
