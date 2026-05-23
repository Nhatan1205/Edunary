using FluentValidation;

namespace Edunary.Application.CourseReviews.Commands.ResolveReviewFeedbackCommand;

public class ResolveReviewFeedbackCommandValidator : AbstractValidator<ResolveReviewFeedbackCommand>
{
    public ResolveReviewFeedbackCommandValidator()
    {
        RuleFor(x => x.FeedbackId)
            .GreaterThan(0)
            .WithMessage("FeedbackId must be valid.");
    }
}
