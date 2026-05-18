using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.Assignments.Commands.PublishAssignmentCommand;

public record PublishAssignmentCommand : IRequest<Result>
{
    public int AssignmentId { get; init; }
    public bool IsPublished { get; init; }
}

public class PublishAssignmentCommandHandler : IRequestHandler<PublishAssignmentCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public PublishAssignmentCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<Result> Handle(PublishAssignmentCommand request, CancellationToken cancellationToken)
    {
        Assignment assignment = await _context.Assignments
            .Include(a => a.Questions)
            .FirstOrDefaultAsync(a => a.Id == request.AssignmentId, cancellationToken);

        if (assignment == null)
            return Result.Failure(new[] { "Assignment not found." });

        bool canManage = await _courseAuth.HasCourseAccessAsync(assignment.CourseId, _currentUserService.UserId, CoursePermission.Manage, cancellationToken);
        if (!canManage)
            return Result.Failure(new[] { "Access denied." });

        if (request.IsPublished)
        {
            if (string.IsNullOrWhiteSpace(assignment.Title))
                return Result.Failure(new[] { "Title is required before publishing." });

            if (string.IsNullOrWhiteSpace(assignment.Description))
                return Result.Failure(new[] { "Description is required before publishing." });

            if (string.IsNullOrWhiteSpace(assignment.Instructions))
                return Result.Failure(new[] { "Instructions are required before publishing." });

            if (assignment.EstimatedDurationMinutes < 1)
                return Result.Failure(new[] { "Estimated duration must be at least 1 minute." });

            if (!assignment.Questions.Any())
                return Result.Failure(new[] { "At least one question is required before publishing." });
        }

        assignment.IsPublished = request.IsPublished;
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
