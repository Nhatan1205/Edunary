using System.Text.Json;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Roadmaps.Models;
using Edunary.Application.SystemSettings.Queries.GetAIConfigQuery;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace Edunary.Application.Roadmaps.Commands.GenerateAIRoadmapCommand;

public record GenerateAIRoadmapCommand : IRequest<ReturnResult<GeneratedAIRoadmapDto>>
{
    public string Description { get; init; } = string.Empty;
    public int RoadmapTopicId { get; init; }
}

public class GenerateAIRoadmapCommandHandler : IRequestHandler<GenerateAIRoadmapCommand, ReturnResult<GeneratedAIRoadmapDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ISender _sender;
    private readonly IAICenterClient _aiCenterClient;
    private readonly ICurrentUserService _currentUserService;
    private readonly INotifyService _notifyService;
    private readonly ILogger<GenerateAIRoadmapCommandHandler> _logger;

    public GenerateAIRoadmapCommandHandler(
        IApplicationDbContext context,
        ISender sender,
        IAICenterClient aiCenterClient,
        ICurrentUserService currentUserService,
        INotifyService notifyService,
        ILogger<GenerateAIRoadmapCommandHandler> logger)
    {
        _context = context;
        _sender = sender;
        _aiCenterClient = aiCenterClient;
        _currentUserService = currentUserService;
        _notifyService = notifyService;
        _logger = logger;
    }

    public async Task<ReturnResult<GeneratedAIRoadmapDto>> Handle(GenerateAIRoadmapCommand request, CancellationToken ct)
    {
        var userId = _currentUserService?.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            return new ReturnResult<GeneratedAIRoadmapDto>
            {
                Result = null,
                Message = "Unauthorized"
            };
        }

        try
        {
            await SendProgress(userId, 10, "Analyzing your learning profile...");

            // 1. Get LearnerProfile
            var profile = await _context.LearnerProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.StudentId == userId, ct);

            // Deserialize preferred IDs from profile
            List<int> preferredCategoryIds;
            if (profile != null && !string.IsNullOrEmpty(profile.PreferredCategoryIds))
            {
                preferredCategoryIds = JsonSerializer.Deserialize<List<int>>(profile.PreferredCategoryIds) ?? new();
            }
            else
            {
                preferredCategoryIds = new();
            }

            List<int> preferredTopicIds;
            if (profile != null && !string.IsNullOrEmpty(profile.PreferredTopicIds))
            {
                preferredTopicIds = JsonSerializer.Deserialize<List<int>>(profile.PreferredTopicIds) ?? new();
            }
            else
            {
                preferredTopicIds = new();
            }

            
            CourseLevel skillLevel;
            if (!Enum.TryParse<CourseLevel>(profile?.SkillLevel, out skillLevel))
            {
                skillLevel = CourseLevel.All;
            }

            // 2. Get enrolled course IDs 
            var enrolledIds = await _context.Enrollments
                .Where(e => e.StudentId == userId)
                .Select(e => e.CourseId)
                .ToListAsync(ct);

            // 3. Resolve topic/category names
            var preferredTopicNames = preferredTopicIds.Count > 0
                ? await _context.Topics
                    .Where(t => preferredTopicIds.Contains(t.Id))
                    .Select(t => t.Name)
                    .ToListAsync(ct)
                : new List<string>();

            var preferredCategoryNames = preferredCategoryIds.Count > 0
                ? await _context.Categories
                    .Where(c => preferredCategoryIds.Contains(c.Id))
                    .Select(c => c.Title)
                    .ToListAsync(ct)
                : new List<string>();

            var roadmapTopicName = await _context.RoadmapTopics
                .Where(t => t.Id == request.RoadmapTopicId)
                .Select(t => t.Title)
                .FirstOrDefaultAsync(ct) ?? string.Empty;

            await SendProgress(userId, 25, "Understanding your current skills...");

            // 4. Get AI config
            var aiConfig = await _sender.Send(new GetAIConfigQuery(), ct);

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
                    description = request.Description,
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

            var (isSuccess, body) = await _aiCenterClient.PostAsync(url, aiConfig.AICenterApiKey, JsonSerializer.Serialize(payload), ct);

            if (!isSuccess)
            {
                _logger.LogError("AI Center generate failed: {Body}", body);
                return new ReturnResult<GeneratedAIRoadmapDto>
                {
                    Result = null,
                    Message = "AI roadmap generation failed. Please try again."
                };
            }

            await SendProgress(userId, 80, "Validating and optimizing results...");

            // 6. Parse AI response
            var aiResponse = JsonSerializer.Deserialize<JsonElement>(body);
            var data = aiResponse.GetProperty("data");
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

            var nodes = JsonSerializer.Deserialize<List<RoadmapNodeData>>(data.GetProperty("nodes").GetRawText(), options) ?? new();
            var edges = JsonSerializer.Deserialize<List<RoadmapEdgeData>>(data.GetProperty("edges").GetRawText(), options) ?? new();

            // 7. Validate against searched_course_ids returned by AI Center
            //    AI Center returns the IDs it actually retrieved from Qdrant — strip anything outside that set
            HashSet<int> validCourseIds;
            if (data.TryGetProperty("searched_course_ids", out var searchedIdsEl))
            {
                var searchedIds = JsonSerializer.Deserialize<List<int>>(searchedIdsEl.GetRawText(), options) ?? new();
                validCourseIds = searchedIds.ToHashSet();
            }
            else
            {
                // Fallback: trust AI Center (no searched_course_ids in response)
                validCourseIds = nodes.Select(n => n.CourseId).ToHashSet();
                _logger.LogWarning("AI Center response missing searched_course_ids — skipping hallucination check.");
            }

            var invalidNodeIds = nodes.Where(n => !validCourseIds.Contains(n.CourseId)).Select(n => n.ClientNodeId).ToHashSet();
            if (invalidNodeIds.Count > 0)
            {
                _logger.LogWarning("AI returned courseIds outside searched set, stripping {Count} node(s).", invalidNodeIds.Count);
                nodes = nodes.Where(n => validCourseIds.Contains(n.CourseId)).ToList();
                edges = edges.Where(e => !invalidNodeIds.Contains(e.SourceNodeId) && !invalidNodeIds.Contains(e.TargetNodeId)).ToList();
            }

            if (nodes.Count == 0)
            {
                return new ReturnResult<GeneratedAIRoadmapDto>
                {
                    Result = null,
                    Message = "AI could not generate a valid roadmap for your profile. Please try a different goal or topic."
                };
            }

            // 8. Build GraphData
            var graphData = new RoadmapGraphData
            {
                Nodes = nodes,
                Edges = edges
            };

            // 9. Save Roadmap
            // Use AI-generated summary as description (richer than raw user prompt).
            // Fall back to original request description if AI didn't return one.
            var aiSummary = data.TryGetProperty("summary", out var summaryEl)
                ? summaryEl.GetString()
                : null;
            var finalDescription = !string.IsNullOrWhiteSpace(aiSummary)
                ? aiSummary
                : request.Description;

            var roadmap = new Roadmap
            {
                Title = $"{roadmapTopicName} Career Path",
                Subtitle = $"Personalized {skillLevel} path · {roadmapTopicName}",
                Description = finalDescription,
                Level = skillLevel,
                IsPublic = false,
                RoadmapTopicId = request.RoadmapTopicId,
                GraphData = JsonSerializer.Serialize(graphData),
                Source = RoadmapSource.AIGenerated,
            };

            _context.Roadmaps.Add(roadmap);
            await _context.SaveChangesAsync(ct);

            await SendProgress(userId, 100, "Your roadmap is ready!");

            return new ReturnResult<GeneratedAIRoadmapDto>
            {
                Result = new GeneratedAIRoadmapDto
                {
                    Id = roadmap.Id,
                    Title = roadmap.Title,
                    NodeCount = nodes.Count
                },
                Message = "AI roadmap generated successfully"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError("GenerateAIRoadmap failed: {Error}", ex.Message);
            return new ReturnResult<GeneratedAIRoadmapDto> { Result = null, Message = $"An error occurred: {ex.Message}" };
        }
    }

    private Task SendProgress(string userId, int percent, string message)
    {
        return _notifyService.SendToUser(userId, "RoadmapProgress", new { percent, message });
    }
}
