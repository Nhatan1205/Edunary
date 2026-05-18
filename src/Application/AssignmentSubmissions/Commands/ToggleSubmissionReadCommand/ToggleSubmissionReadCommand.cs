using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.AssignmentSubmissions.Commands.ToggleSubmissionReadCommand;

public record ToggleSubmissionReadCommand : IRequest<Result>
{
    public int SubmissionId { get; init; }
    public bool IsRead { get; init; }
}

public class ToggleSubmissionReadCommandHandler : IRequestHandler<ToggleSubmissionReadCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public ToggleSubmissionReadCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<Result> Handle(ToggleSubmissionReadCommand request, CancellationToken cancellationToken)
    {
        AssignmentSubmission submission = await _context.AssignmentSubmissions
            .Include(s => s.Assignment)
            .FirstOrDefaultAsync(s => s.Id == request.SubmissionId, cancellationToken);

        if (submission == null)
            return Result.Failure(new[] { "Submission not found." });

        bool canAccess = await _courseAuth.HasCourseAccessAsync(submission.Assignment.CourseId, _currentUserService.UserId, CoursePermission.Assignments, cancellationToken);
        if (!canAccess)
            return Result.Failure(new[] { "Access denied." });

        submission.IsRead = request.IsRead;
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
