using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseReviews.Commands.SaveReviewFeedbackCommand;

public record SaveReviewFeedbackCommand : IRequest<Result>
{
    public int CourseReviewSubmissionId { get; init; }
    public ReviewFeedbackType FeedbackType { get; init; }
    public ReviewFeedbackCategory Category { get; init; }
    public string Content { get; init; }
}

public class SaveReviewFeedbackCommandHandler : IRequestHandler<SaveReviewFeedbackCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;

    public SaveReviewFeedbackCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IIdentityService identityService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _identityService = identityService;
    }

    public async Task<Result> Handle(SaveReviewFeedbackCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = _currentUserService.UserId;

            var submission = await _context.CourseReviewSubmissions
                .FirstOrDefaultAsync(s => s.Id == request.CourseReviewSubmissionId, cancellationToken);

            Guard.Against.NotFound(request.CourseReviewSubmissionId, submission);

            if (submission.Status != ReviewSubmissionStatus.Pending)
            {
                return Result.Failure(["Feedback can only be added to submissions with Pending status."]);
            }

            var feedback = new CourseReviewFeedback
            {
                CourseReviewSubmissionId = request.CourseReviewSubmissionId,
                FeedbackType = request.FeedbackType,
                Category = request.Category,
                Content = request.Content,
                IsResolved = false,
            };

            _context.CourseReviewFeedbacks.Add(feedback);
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure([ex.Message]);
        }
    }
}
