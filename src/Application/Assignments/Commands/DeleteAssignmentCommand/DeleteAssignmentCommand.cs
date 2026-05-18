using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.Assignments.Commands.DeleteAssignmentCommand;

public record DeleteAssignmentCommand : IRequest<Result>
{
    public List<int> AssignmentIds { get; init; } = new();
}

public class DeleteAssignmentCommandHandler : IRequestHandler<DeleteAssignmentCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public DeleteAssignmentCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<Result> Handle(DeleteAssignmentCommand request, CancellationToken cancellationToken)
    {
        if (request.AssignmentIds == null || request.AssignmentIds.Count == 0)
            return Result.Success();

        var assignments = await _context.Assignments
            .Where(a => request.AssignmentIds.Contains(a.Id))
            .ToListAsync(cancellationToken);

        // Check manage permission per distinct courseId
        var courseIds = assignments.Select(a => a.CourseId).Distinct();
        foreach (var courseId in courseIds)
        {
            bool canManage = await _courseAuth.HasCourseAccessAsync(courseId, _currentUserService.UserId, CoursePermission.Manage, cancellationToken);
            if (!canManage)
                return Result.Failure(new[] { "Access denied." });
        }

        _context.Assignments.RemoveRange(assignments);
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
