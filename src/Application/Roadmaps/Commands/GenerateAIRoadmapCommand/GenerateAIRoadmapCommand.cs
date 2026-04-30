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
    public string Goal { get; init; } = string.Empty;
    public int CategoryId { get; init; }
    public int RoadmapTopicId { get; init; }
    public CourseLevel Level { get; init; }
    public List<string> KnownSkills { get; init; } = new();
    public int WeeklyHours { get; init; }
    public int TimelineMonths { get; init; }   // 0 = no deadline
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
            return new ReturnResult<GeneratedAIRoadmapDto> 
            { 
                Result = null, 
                Message = "Unauthorized" 
            };

        try
        {
            // ── 10% ──
            await SendProgress(userId, 10, "Analyzing your learning profile...");

            // 1. Validate RoadmapTopicId exists
            var topicExists = await _context.RoadmapTopics.AnyAsync(t => t.Id == request.RoadmapTopicId, ct);
            if (!topicExists)
                return new ReturnResult<GeneratedAIRoadmapDto> { 
                    Result = null, 
                    Message = "Invalid roadmap topic." 
                };

            // 2. Upsert LearnerProfile
            var profile = await _context.LearnerProfiles
                .FirstOrDefaultAsync(p => p.StudentId == userId, ct);

            if (profile == null)
            {
                profile = new LearnerProfile { StudentId = userId };
                _context.LearnerProfiles.Add(profile);
            }

            profile.Goal = request.Goal;
            profile.SkillLevel = request.Level.ToString();
            profile.WeeklyHours = request.WeeklyHours;

            // Accumulate preferred categories across wizard sessions
            var preferredIds = string.IsNullOrEmpty(profile.PreferredCategoryIds)
                ? new List<int>()
                : JsonSerializer.Deserialize<List<int>>(profile.PreferredCategoryIds) ?? new List<int>();
            if (!preferredIds.Contains(request.CategoryId))
            {
                preferredIds.Add(request.CategoryId);
                profile.PreferredCategoryIds = JsonSerializer.Serialize(preferredIds);
            }

            await _context.SaveChangesAsync(ct);

            // 3. Get implicit student context (enrolled + completed)
            var enrolledIds = await _context.Enrollments
                .Where(e => e.StudentId == userId)
                .Select(e => e.CourseId)
                .ToListAsync(ct);

            var completedIds = await _context.CourseProgress
                .Where(p => p.StudentId == userId)
                .Select(p => p.CourseId)
                .ToListAsync(ct);

            // Resolve preferred topic names from LearnerProfile (for AI signal)
            var preferredTopicIds = string.IsNullOrEmpty(profile.PreferredTopicIds)
                ? new List<int>()
                : JsonSerializer.Deserialize<List<int>>(profile.PreferredTopicIds) ?? new List<int>();

            var preferredTopicNames = preferredTopicIds.Count > 0
                ? await _context.Topics
                    .Where(t => preferredTopicIds.Contains(t.Id))
                    .Select(t => t.Name)
                    .ToListAsync(ct)
                : new List<string>();

            // ── 25% ──
            await SendProgress(userId, 25, "Understanding your current skills...");

            // 4. Filter course catalog (4 steps in one query)
            // Courses matching student's preferred topics are sorted to the top (soft boost, not hard exclude)
            var catalog = await _context.Courses
                .Include(c => c.Topics)
                .Where(c => c.Status == CourseStatus.Public
                         && c.CategoryId == request.CategoryId
                         && !enrolledIds.Contains(c.Id)
                         && (c.TotalStudents >= 1 || c.Ratings >= 1))
                .OrderByDescending(c => c.Topics.Any(t => preferredTopicIds.Contains(t.Id)) ? 1 : 0)
                .ThenByDescending(c => c.Ratings)
                .ThenByDescending(c => c.TotalStudents)
                .Take(50)
                .Select(c => new
                {
                    id = c.Id,
                    title = c.Title,
                    level = c.Level.ToString(),
                    topics = c.Topics.Select(t => t.Name).ToList(),
                    ratings = c.Ratings,
                    total_students = c.TotalStudents,
                    learning_objectives = c.LearningObjectives
                })
                .ToListAsync(ct);

            // ── 40% ──
            await SendProgress(userId, 40, "Finding relevant courses in our library...");

            // 5. Get AI config + build payload
            var aiConfig = await _sender.Send(new GetAIConfigQuery(), ct);

            var payload = new
            {
                student_profile = new
                {
                    goal = request.Goal,
                    skill_level = request.Level.ToString(),
                    known_skills = request.KnownSkills,
                    preferred_topics = preferredTopicNames,   // topic names for AI reasoning
                    weekly_hours = request.WeeklyHours,
                    timeline_months = request.TimelineMonths,
                    enrolled_course_ids = enrolledIds,
                    completed_course_ids = completedIds
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

            var url = $"{aiConfig.AICenterBaseUrl}api/roadmap/generate-personalized";

            // ── 50% ── (slowest step — LLM call 3–8s)
            await SendProgress(userId, 50, "AI is designing your personalized roadmap...");

            var (isSuccess, body) = await _aiCenterClient.PostAsync(url, aiConfig.AICenterApiKey, JsonSerializer.Serialize(payload), ct);

            if (!isSuccess)
            {
                _logger.LogError("AI Center generate-personalized failed: {Body}", body);
                return new ReturnResult<GeneratedAIRoadmapDto> 
                { 
                    Result = null, 
                    Message = "AI roadmap generation failed. Please try again." 
                };
            }

            // ── 80% ──
            await SendProgress(userId, 80, "Validating and optimizing results...");

            // 6. Parse AI response
            var aiResponse = JsonSerializer.Deserialize<JsonElement>(body);
            var data = aiResponse.GetProperty("data");
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

            var aiNodes = JsonSerializer.Deserialize<List<AiNodeResult>>(data.GetProperty("nodes").GetRawText(), options) ?? new();
            var aiEdges = JsonSerializer.Deserialize<List<AiEdgeResult>>(data.GetProperty("edges").GetRawText(), options) ?? new();
            var aiSummary = data.TryGetProperty("summary", out var summaryEl) ? summaryEl.GetString() ?? string.Empty : string.Empty;

            // 7. Strip any courseIds the AI hallucinated (not in catalog)
            var validCourseIds = catalog.Select(c => c.id).ToHashSet();
            var invalidNodeIds = aiNodes.Where(n => !validCourseIds.Contains(n.CourseId)).Select(n => n.ClientNodeId).ToHashSet();
            if (invalidNodeIds.Count > 0)
            {
                _logger.LogWarning("AI returned invalid courseIds, stripping {Count} node(s).", invalidNodeIds.Count);
                aiNodes = aiNodes.Where(n => validCourseIds.Contains(n.CourseId)).ToList();
                aiEdges = aiEdges.Where(e => !invalidNodeIds.Contains(e.SourceNodeId) && !invalidNodeIds.Contains(e.TargetNodeId)).ToList();
            }

            if (aiNodes.Count == 0)
            {
                return new ReturnResult<GeneratedAIRoadmapDto>
                {
                    Result = null,
                    Message = "AI could not generate a valid roadmap for your profile. Please try a different goal or domain."
                };
            }

            // 8. Build GraphData + AiMetadata
            var graphData = new RoadmapGraphData
            {
                Nodes = aiNodes.Select(n => new RoadmapNodeData
                {
                    ClientNodeId = n.ClientNodeId,
                    CourseId = n.CourseId,
                    PositionX = n.PositionX,
                    PositionY = n.PositionY,
                    SortOrder = n.SortOrder
                }).ToList(),
                Edges = aiEdges.Select(e => new RoadmapEdgeData
                {
                    SourceNodeId = e.SourceNodeId,
                    TargetNodeId = e.TargetNodeId
                }).ToList()
            };

            var aiMetadata = new
            {
                reasonings = aiNodes.Select(n => new { nodeId = n.ClientNodeId, reason = n.Reason }),
                summary = aiSummary
            };

            // 9. Save Roadmap
            var roadmap = new Roadmap
            {
                Title = $"{request.Goal} — AI Roadmap",
                Subtitle = $"Personalized {request.Level} path",
                Description = aiSummary,
                Level = request.Level,
                IsPublic = false,
                IsAiGenerated = true,
                GraphData = JsonSerializer.Serialize(graphData),
                AiMetadata = JsonSerializer.Serialize(aiMetadata),
                RoadmapTopicId = request.RoadmapTopicId
            };

            _context.Roadmaps.Add(roadmap);
            await _context.SaveChangesAsync(ct);

            // ── 100% ──
            await SendProgress(userId, 100, "Your roadmap is ready!");

            return new ReturnResult<GeneratedAIRoadmapDto>
            {
                Result = new GeneratedAIRoadmapDto
                {
                    Id = roadmap.Id,
                    Title = roadmap.Title,
                    Summary = aiSummary,
                    NodeCount = aiNodes.Count
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
