using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.Assignments.Commands.LinkAssignmentToItemCommand;

public record LinkAssignmentToItemCommand : IRequest<Result>
{
    public int AssignmentId { get; init; }
    public string ItemId { get; init; } = string.Empty;
}

public class LinkAssignmentToItemCommandHandler : IRequestHandler<LinkAssignmentToItemCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public LinkAssignmentToItemCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<Result> Handle(LinkAssignmentToItemCommand request, CancellationToken cancellationToken)
    {
        Assignment assignment = await _context.Assignments
            .FirstOrDefaultAsync(a => a.Id == request.AssignmentId, cancellationToken);

        if (assignment == null)
            return Result.Failure(new[] { "Assignment not found." });

        bool canManage = await _courseAuth.HasCourseAccessAsync(assignment.CourseId, _currentUserService.UserId, CoursePermission.Manage, cancellationToken);
        if (!canManage)
            return Result.Failure(new[] { "Access denied." });

        assignment.ItemId = request.ItemId;
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
