using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseReviews.Commands.UpdateReviewFeedbackCommand;

public record UpdateReviewFeedbackCommand : IRequest<Result>
{
    public int FeedbackId { get; init; }
    public ReviewFeedbackType FeedbackType { get; init; }
    public ReviewFeedbackCategory Category { get; init; }
    public string Content { get; init; }
}

public class UpdateReviewFeedbackCommandHandler : IRequestHandler<UpdateReviewFeedbackCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateReviewFeedbackCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(UpdateReviewFeedbackCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        var feedback = await _context.CourseReviewFeedbacks
            .Include(f => f.Submission)
            .FirstOrDefaultAsync(f => f.Id == request.FeedbackId, cancellationToken);

        Guard.Against.NotFound(request.FeedbackId, feedback);

        if (feedback.Submission.Status != ReviewSubmissionStatus.Pending)
        {
            return Result.Failure("Feedback can only be edited on submissions with Pending status.");
        }

        feedback.FeedbackType = request.FeedbackType;
        feedback.Category = request.Category;
        feedback.Content = request.Content;

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(message: "Feedback updated successfully.");
    }
}
