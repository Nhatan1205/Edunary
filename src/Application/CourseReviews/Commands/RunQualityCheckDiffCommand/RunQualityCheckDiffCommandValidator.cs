using FluentValidation;

namespace Edunary.Application.CourseReviews.Commands.RunQualityCheckDiffCommand;

public class RunQualityCheckDiffCommandValidator : AbstractValidator<RunQualityCheckDiffCommand>
{
    public RunQualityCheckDiffCommandValidator()
    {
        RuleFor(x => x.CourseId)
            .GreaterThan(0)
            .WithMessage("CourseId must be greater than 0.");
    }
}
