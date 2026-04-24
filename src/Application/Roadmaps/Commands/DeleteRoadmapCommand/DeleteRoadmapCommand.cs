using Edunary.Application.Common.Behaviours;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;

namespace Edunary.Application.Roadmaps.Commands.DeleteRoadmapCommand;



[ActivityLog(ActivityType.DeleteRoadmap, "Delete Roadmap")]
public record DeleteRoadmapCommand : IRequest<Result>
{
    public int Id { get; init; }
}

public class DeleteRoadmapCommandHandler : IRequestHandler<DeleteRoadmapCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public DeleteRoadmapCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(DeleteRoadmapCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Roadmaps
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        var userId = _currentUserService?.UserId;

        if (entity.CreatedBy != userId)
        {
            return Result.Failure("You are not authorized to delete this roadmap.");
        }

        _context.Roadmaps.Remove(entity);

        var result = await _context.SaveChangesAsync(cancellationToken);

        if (result > 0)
        {
            return Result.Success($"Roadmap deleted.");
        }

        return Result.Failure("Roadmap deleted unsuccessfully.");
    }
}
