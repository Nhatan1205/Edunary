using System.Text.Json;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Roadmaps.Models;
using Edunary.Domain.Enums;

namespace Edunary.Application.Roadmaps.Commands.UpdateRoadmapCommand;

public record UpdateRoadmapCommand : IRequest<Result>
{
    public int Id { get; init; }

    public string Title { get; init; }

    public string Subtitle { get; init; }

    public string Description { get; init; }

    public int RoadmapTopicId { get; init; }

    public CourseLevel SkillLevel { get; init; }

    public bool IsPublic { get; init; }

    public string GraphData { get; init; }
}

public class UpdateRoadmapCommandHandler : IRequestHandler<UpdateRoadmapCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateRoadmapCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(UpdateRoadmapCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var entity = await _context.Roadmaps
                .FindAsync(new object[] { request.Id }, cancellationToken);

            Guard.Against.NotFound(request.Id, entity);

            // Verify ownership
            var userId = _currentUserService?.UserId;
            if (entity.CreatedBy != userId)
            {
                return Result.Failure("You are not authorized to update this roadmap.");
            }

            // Verify that the RoadmapTopic exists
            var topicExists = await _context.RoadmapTopics
                .AnyAsync(t => t.Id == request.RoadmapTopicId, cancellationToken);

            if (!topicExists)
            {
                return Result.Failure("RoadmapTopic not found.");
            }

            // Validate GraphData JSON structure
            if (!string.IsNullOrEmpty(request.GraphData))
            {
                try
                {
                    var graphData = JsonSerializer.Deserialize<RoadmapGraphData>(request.GraphData, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                    if (graphData == null)
                    {
                        return Result.Failure("GraphData has invalid JSON structure.");
                    }
                }
                catch (JsonException)
                {
                    return Result.Failure("GraphData is not valid JSON.");
                }
            }

            entity.Title = request.Title;
            entity.Subtitle = request.Subtitle;
            entity.Description = request.Description;
            entity.RoadmapTopicId = request.RoadmapTopicId;
            entity.Level = request.SkillLevel;
            entity.IsPublic = request.IsPublic;

            if (!string.IsNullOrEmpty(request.GraphData))
            {
                entity.GraphData = request.GraphData;
            }

            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success(message: "Roadmap updated successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"An unexpected error occurred while updating roadmap: {ex.Message}");
        }
    }
}
