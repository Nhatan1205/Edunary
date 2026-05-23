using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseReviews.Commands.SubmitCourseForReviewCommand;

public record SubmitCourseForReviewCommand : IRequest<Result>
{
    public int CourseId { get; init; }
}

public class SubmitCourseForReviewCommandHandler : IRequestHandler<SubmitCourseForReviewCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public SubmitCourseForReviewCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<Result> Handle(SubmitCourseForReviewCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        // 1. Check course access (Owner or Collaborator with Manage permission)
        var hasAccess = await _courseAuth.HasCourseAccessAsync(
            request.CourseId, userId, CoursePermission.Manage, cancellationToken);

        if (!hasAccess)
            return Result.Failure(["You do not have permission to submit this course for review."]);

        // 2. Load course
        var course = await _context.Courses
            .FirstOrDefaultAsync(c => c.Id == request.CourseId, cancellationToken);

        Guard.Against.NotFound(request.CourseId, course);

        // 3. Validate status
        if (course.Status != CourseStatus.Unpublished && course.Status != CourseStatus.NeedsChanges)
            return Result.Failure([$"Course already submitted for review."]);

        // 4. If NeedsChanges: check all RequiredFix feedbacks are resolved
        if (course.Status == CourseStatus.NeedsChanges)
        {
            var latestSubmission = await _context.CourseReviewSubmissions
                .Where(s => s.CourseId == request.CourseId)
                .OrderByDescending(s => s.SubmissionNumber)
                .FirstOrDefaultAsync(cancellationToken);

            if (latestSubmission != null)
            {
                var hasUnresolvedRequired = await _context.CourseReviewFeedbacks
                    .AnyAsync(f =>
                        f.CourseReviewSubmissionId == latestSubmission.Id &&
                        f.FeedbackType == ReviewFeedbackType.RequiredFix &&
                        !f.IsResolved,
                        cancellationToken);

                if (hasUnresolvedRequired)
                    return Result.Failure(["All required fixes must be resolved before resubmitting."]);
            }
        }

        // 5. Get next submission number
        var submissionCount = await _context.CourseReviewSubmissions
            .CountAsync(s => s.CourseId == request.CourseId, cancellationToken);

        // 6. Create new submission
        var submission = new CourseReviewSubmission
        {
            CourseId = request.CourseId,
            Status = ReviewSubmissionStatus.Pending,
            SubmissionNumber = submissionCount + 1,
        };

        _context.CourseReviewSubmissions.Add(submission);

        // 7. Update course status
        course.Status = CourseStatus.PendingReview;

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
