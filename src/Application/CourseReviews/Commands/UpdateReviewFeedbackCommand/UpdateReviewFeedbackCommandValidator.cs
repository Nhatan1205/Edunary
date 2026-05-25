using FluentValidation;

namespace Edunary.Application.CourseReviews.Commands.UpdateReviewFeedbackCommand;

public class UpdateReviewFeedbackCommandValidator : AbstractValidator<UpdateReviewFeedbackCommand>
{
    public UpdateReviewFeedbackCommandValidator()
    {
        RuleFor(x => x.FeedbackId)
            .GreaterThan(0)
            .WithMessage("FeedbackId must be valid.");

        RuleFor(x => x.Content)
            .NotEmpty()
            .WithMessage("Feedback content is required.")
            .MaximumLength(2000)
            .WithMessage("Feedback content must not exceed 2000 characters.");

        RuleFor(x => x.FeedbackType)
            .IsInEnum()
            .WithMessage("Invalid feedback type.");

        RuleFor(x => x.Category)
            .IsInEnum()
            .WithMessage("Invalid feedback category.");
    }
}
