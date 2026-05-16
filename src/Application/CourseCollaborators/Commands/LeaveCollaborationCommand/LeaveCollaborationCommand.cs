using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseCollaborators.Commands.LeaveCollaborationCommand;

public record LeaveCollaborationCommand : IRequest<Result>
{
    public int CourseId { get; init; }
}

public class LeaveCollaborationCommandHandler : IRequestHandler<LeaveCollaborationCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public LeaveCollaborationCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(LeaveCollaborationCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        var collab = await _context.CourseCollaborators
            .FirstOrDefaultAsync(c => c.CourseId == request.CourseId
                                   && c.UserId == userId
                                   && c.InviteStatus == CollaboratorInviteStatus.Accepted,
                                   cancellationToken);

        if (collab is null)
            return Result.Failure("You are not a collaborator on this course.");

        _context.CourseCollaborators.Remove(collab);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success("You have left this course collaboration.");
    }
}
