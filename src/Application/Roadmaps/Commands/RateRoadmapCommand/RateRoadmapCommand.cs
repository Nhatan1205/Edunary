using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Roadmaps.Commands.RateRoadmapCommand;

public record RateRoadmapCommand : IRequest<Result>
{
    public int RoadmapId { get; init; }
    public int Rating { get; init; }   // 1 = thumbs down, 2 = thumbs up
}

public class RateRoadmapCommandHandler : IRequestHandler<RateRoadmapCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public RateRoadmapCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(RateRoadmapCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = _currentUserService?.UserId;
            if (string.IsNullOrEmpty(userId))
                return Result.Failure("Unauthorized.");

            var roadmap = await _context.Roadmaps
                .FindAsync(new object[] { request.RoadmapId }, cancellationToken);

            Guard.Against.NotFound(request.RoadmapId, roadmap);

            if (!roadmap.IsAiGenerated)
                return Result.Failure("Only AI-generated roadmaps can be rated.");

            if (roadmap.CreatedBy != userId)
                return Result.Failure("You are not authorized to rate this roadmap.");

            roadmap.UserRating = request.Rating;
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success(null, "Roadmap rated successfully.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"An error occurred: {ex.Message}");
        }
    }
}
