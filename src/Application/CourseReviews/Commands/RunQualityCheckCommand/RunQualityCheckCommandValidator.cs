using FluentValidation;

namespace Edunary.Application.CourseReviews.Commands.RunQualityCheckCommand;

public class RunQualityCheckCommandValidator : AbstractValidator<RunQualityCheckCommand>
{
    public RunQualityCheckCommandValidator()
    {
        RuleFor(v => v.CourseId)
            .GreaterThan(0)
            .WithMessage("CourseId is required.");
    }
}
