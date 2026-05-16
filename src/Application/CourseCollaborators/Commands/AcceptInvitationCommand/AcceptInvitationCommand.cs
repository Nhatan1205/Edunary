using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseCollaborators.Commands.AcceptInvitationCommand;

public record AcceptInvitationCommand : IRequest<Result>
{
    public int CollaboratorId { get; init; }
}

public class AcceptInvitationCommandHandler : IRequestHandler<AcceptInvitationCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public AcceptInvitationCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(AcceptInvitationCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        var collab = await _context.CourseCollaborators
            .FirstOrDefaultAsync(c => c.Id == request.CollaboratorId && c.UserId == userId, cancellationToken);

        if (collab is null)
            return Result.Failure("Invitation not found.");

        if (collab.InviteStatus != CollaboratorInviteStatus.Pending)
            return Result.Failure("This invitation has already been responded to.");

        collab.InviteStatus = CollaboratorInviteStatus.Accepted;
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success("Invitation accepted.");
    }
}
