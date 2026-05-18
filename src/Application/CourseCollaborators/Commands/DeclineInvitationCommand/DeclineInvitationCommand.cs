using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseCollaborators.Commands.DeclineInvitationCommand;

public record DeclineInvitationCommand : IRequest<Result>
{
    public int CollaboratorId { get; init; }
}

public class DeclineInvitationCommandHandler : IRequestHandler<DeclineInvitationCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public DeclineInvitationCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(DeclineInvitationCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        var collab = await _context.CourseCollaborators
            .FirstOrDefaultAsync(c => c.Id == request.CollaboratorId && c.UserId == userId, cancellationToken);

        if (collab is null)
            return Result.Failure("Invitation not found.");

        if (collab.InviteStatus != CollaboratorInviteStatus.Pending)
            return Result.Failure("This invitation has already been responded to.");

        _context.CourseCollaborators.Remove(collab);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success("Invitation declined.");
    }
}
