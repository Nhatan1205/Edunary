using FluentValidation;

namespace Edunary.Application.CourseReviews.Commands.ApproveCourseCommand;

public class ApproveCourseCommandValidator : AbstractValidator<ApproveCourseCommand>
{
    public ApproveCourseCommandValidator()
    {
        RuleFor(x => x.SubmissionId)
            .GreaterThan(0)
            .WithMessage("SubmissionId must be valid.");
    }
}
