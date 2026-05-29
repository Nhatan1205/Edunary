using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseCollaborators.Commands.UpdateCollaboratorCommand;

public record UpdateCollaboratorCommand : IRequest<Result>
{
    public int CollaboratorId { get; init; }
    public int CourseId { get; init; }
    public CoursePermission Permissions { get; init; }
    public bool IsVisible { get; init; }
    public decimal RevenueSharePercent { get; init; }
}

public class UpdateCollaboratorCommandHandler : IRequestHandler<UpdateCollaboratorCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public UpdateCollaboratorCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<Result> Handle(UpdateCollaboratorCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        // Only course owner can update collaborator permissions
        if (!await _courseAuth.IsOwnerAsync(request.CourseId, userId, cancellationToken))
        {
            return Result.Failure("Only the course owner can update collaborators.");
        }

        var collab = await _context.CourseCollaborators
            .FirstOrDefaultAsync(c => c.Id == request.CollaboratorId && c.CourseId == request.CourseId, cancellationToken);

        if (collab is null)
            return Result.Failure("Collaborator not found.");

        // Tổng % của các collaborator khác chưa bị từ chối cộng phần mới không được vượt 100%
        var otherTotal = await _context.CourseCollaborators
            .Where(c => c.CourseId == request.CourseId
                     && c.Id != request.CollaboratorId
                     && c.InviteStatus != CollaboratorInviteStatus.Declined)
            .SumAsync(c => c.RevenueSharePercent, cancellationToken);

        if (otherTotal + request.RevenueSharePercent > 100)
            return Result.Failure("Total revenue share for collaborators cannot exceed 100%.");

        collab.Permissions = request.Permissions;
        collab.IsVisible = request.IsVisible;
        collab.RevenueSharePercent = request.RevenueSharePercent;

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success("Collaborator updated.");
    }
}
