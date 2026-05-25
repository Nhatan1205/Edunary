using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseReviews.Commands.DeleteReviewFeedbackCommand;

public record DeleteReviewFeedbackCommand : IRequest<Result>
{
    public int FeedbackId { get; init; }
}

public class DeleteReviewFeedbackCommandHandler : IRequestHandler<DeleteReviewFeedbackCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public DeleteReviewFeedbackCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(DeleteReviewFeedbackCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        var feedback = await _context.CourseReviewFeedbacks
            .Include(f => f.Submission)
            .FirstOrDefaultAsync(f => f.Id == request.FeedbackId, cancellationToken);

        Guard.Against.NotFound(request.FeedbackId, feedback);

        if (feedback.Submission.Status != ReviewSubmissionStatus.Pending)
        {
            return Result.Failure("Feedback can only be deleted on submissions with 'Pending' status.");
        }

        _context.CourseReviewFeedbacks.Remove(feedback);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(message: "Feedback deleted successfully.");
    }
}
