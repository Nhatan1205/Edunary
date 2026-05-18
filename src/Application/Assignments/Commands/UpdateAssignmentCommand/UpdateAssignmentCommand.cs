using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.Assignments.Commands.UpdateAssignmentCommand;

public record UpdateAssignmentCommand : IRequest<Result>
{
    public int AssignmentId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Instructions { get; init; } = string.Empty;
    public int EstimatedDurationMinutes { get; init; }
}

public class UpdateAssignmentCommandHandler : IRequestHandler<UpdateAssignmentCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public UpdateAssignmentCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<Result> Handle(UpdateAssignmentCommand request, CancellationToken cancellationToken)
    {
        var assignment = await _context.Assignments
            .FirstOrDefaultAsync(a => a.Id == request.AssignmentId, cancellationToken);

        if (assignment == null)
            return Result.Failure(new[] { "Assignment not found." });

        bool canManage = await _courseAuth.HasCourseAccessAsync(assignment.CourseId, _currentUserService.UserId, CoursePermission.Manage, cancellationToken);
        if (!canManage)
            return Result.Failure(new[] { "Access denied." });

        assignment.Title = request.Title;
        assignment.Description = request.Description;
        assignment.Instructions = request.Instructions;
        assignment.EstimatedDurationMinutes = request.EstimatedDurationMinutes;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
