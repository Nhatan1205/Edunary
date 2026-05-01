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
    public string RoadmapTopicName { get; init; } = string.Empty;
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

            // 1. Get user personalize metadata
            var profile = await _context.LearnerProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.StudentId == userId, ct);

            // Deserialize preferred ids from profile
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

            // Parse skill level — fallback to All if not set or unrecognized
            CourseLevel skillLevel;
            if (!Enum.TryParse<CourseLevel>(profile?.SkillLevel, out skillLevel))
            {
                skillLevel = CourseLevel.All;
            }

            // 2. Get enrolled course IDs to exclude from catalog
            var enrolledIds = await _context.Enrollments
                .Where(e => e.StudentId == userId)
                .Select(e => e.CourseId)
                .ToListAsync(ct);

            // 3. Get topic/category names
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

            await SendProgress(userId, 25, "Understanding your current skills...");

            // 4. Filter course catalog
            var catalog = await _context.Courses
                .Include(c => c.Topics)
                .Include(c => c.Category)
                .Where(c => c.Status == CourseStatus.Public                            // only get published courses
                         && !enrolledIds.Contains(c.Id)                                // exclude course that user already enrolled
                         && (c.TotalStudents >= 1 || c.Ratings >= 1)                   // exclude ghost/zero-activity courses
                         && (preferredCategoryIds.Contains(c.CategoryId)               // matches any preferred category OR
                             || c.Topics.Any(t => preferredTopicIds.Contains(t.Id))))  // matches any preferred topic
                .OrderByDescending(c => c.Topics.Any(t => preferredTopicIds.Contains(t.Id)) ? 1 : 0)
                .ThenByDescending(c => preferredCategoryIds.Contains(c.CategoryId) ? 1 : 0)
                .ThenByDescending(c => c.Ratings)
                .ThenByDescending(c => c.TotalStudents)
                .Take(50)
                .Select(c => new
                {
                    id = c.Id,
                    title = c.Title,
                    level = c.Level.ToString(),
                    topics = c.Topics.Select(t => t.Name).ToList(),
                    category = c.Category != null ? c.Category.Title : null,
                    ratings = c.Ratings,
                    total_students = c.TotalStudents,
                    learning_objectives = c.LearningObjectives
                })
                .ToListAsync(ct);

            await SendProgress(userId, 40, "Finding relevant courses in our library...");

            // 5. Get AI config + build payload
            var aiConfig = await _sender.Send(new GetAIConfigQuery(), ct);

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
                    roadmap_topic = request.RoadmapTopicName,
                },
                courses_catalog = catalog,
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

            // 7. Strip any courseIds the AI hallucinated (not in catalog)
            var validCourseIds = catalog.Select(c => c.id).ToHashSet();
            var invalidNodeIds = nodes.Where(n => !validCourseIds.Contains(n.CourseId)).Select(n => n.ClientNodeId).ToHashSet();
            if (invalidNodeIds.Count > 0)
            {
                _logger.LogWarning("AI returned invalid courseIds, stripping {Count} node(s).", invalidNodeIds.Count);
                nodes = nodes.Where(n => validCourseIds.Contains(n.CourseId)).ToList();
                edges = edges.Where(e => !invalidNodeIds.Contains(e.SourceNodeId) && !invalidNodeIds.Contains(e.TargetNodeId)).ToList();
            }

            if (nodes.Count == 0)
            {
                return new ReturnResult<GeneratedAIRoadmapDto>
                {
                    Result = null,
                    Message = "AI could not generate a valid roadmap for your profile. Please try a different goal or domain."
                };
            }

            // 8. Build GraphData
            var graphData = new RoadmapGraphData
            {
                Nodes = nodes,
                Edges = edges
            };

            // 9. Save Roadmap
            var roadmap = new Roadmap
            {
                Title = "Your AI Roadmap",
                Subtitle = $"Personalized {skillLevel} path · {request.RoadmapTopicName}",
                Description = request.Description,
                Level = skillLevel,
                IsPublic = false,
                GraphData = JsonSerializer.Serialize(graphData),
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
