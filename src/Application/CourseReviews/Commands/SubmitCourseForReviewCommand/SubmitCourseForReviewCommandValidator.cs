using FluentValidation;

namespace Edunary.Application.CourseReviews.Commands.SubmitCourseForReviewCommand;

public class SubmitCourseForReviewCommandValidator : AbstractValidator<SubmitCourseForReviewCommand>
{
    public SubmitCourseForReviewCommandValidator()
    {
        RuleFor(x => x.CourseId)
            .GreaterThan(0)
            .WithMessage("CourseId must be valid.");
    }
}
