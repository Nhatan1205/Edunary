using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseCollaborators.Commands.RemoveCollaboratorCommand;

public record RemoveCollaboratorCommand : IRequest<Result>
{
    public int CollaboratorId { get; init; }
    public int CourseId { get; init; }
}

public class RemoveCollaboratorCommandHandler : IRequestHandler<RemoveCollaboratorCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public RemoveCollaboratorCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<Result> Handle(RemoveCollaboratorCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        if (!await _courseAuth.IsOwnerAsync(request.CourseId, userId, cancellationToken))
        {
            return Result.Failure("Only the course owner can remove collaborators.");
        }

        var collab = await _context.CourseCollaborators
            .FirstOrDefaultAsync(c => c.Id == request.CollaboratorId && c.CourseId == request.CourseId, cancellationToken);

        if (collab is null)
            return Result.Failure("Collaborator not found.");

        _context.CourseCollaborators.Remove(collab);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success("Collaborator removed.");
    }
}
