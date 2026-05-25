using FluentValidation;

namespace Edunary.Application.CourseReviews.Commands.SaveReviewFeedbackCommand;

public class SaveReviewFeedbackCommandValidator : AbstractValidator<SaveReviewFeedbackCommand>
{
    public SaveReviewFeedbackCommandValidator()
    {
        RuleFor(x => x.CourseReviewSubmissionId)
            .GreaterThan(0)
            .WithMessage("CourseReviewSubmissionId must be valid.");

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
