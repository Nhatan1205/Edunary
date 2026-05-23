using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseReviews.Commands.ResolveReviewFeedbackCommand;

public record ResolveReviewFeedbackCommand : IRequest<Result>
{
    public int FeedbackId { get; init; }
    public bool IsResolved { get; init; }
}

public class ResolveReviewFeedbackCommandHandler : IRequestHandler<ResolveReviewFeedbackCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public ResolveReviewFeedbackCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<Result> Handle(ResolveReviewFeedbackCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        var feedback = await _context.CourseReviewFeedbacks
            .Include(f => f.Submission)
            .FirstOrDefaultAsync(f => f.Id == request.FeedbackId, cancellationToken);

        Guard.Against.NotFound(request.FeedbackId, feedback);

        var hasAccess = await _courseAuth.HasCourseAccessAsync(
            feedback.Submission.CourseId, userId, CoursePermission.Manage, cancellationToken);

        if (!hasAccess)
        {
            return Result.Failure("You do not have permission to resolve this feedback.");
        }

        if (feedback.Submission.Status != ReviewSubmissionStatus.NeedsChanges)
        {
            return Result.Failure("Feedback can only be resolved on submissions with 'NeedsChanges' status.");
        }

        feedback.IsResolved = request.IsResolved;

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(message: "Feedback updated successfully.");
    }
}
