namespace Edunary.Application.LearnerProfiles.Commands.UpsertLearnerProfileCommand;

public class UpsertLearnerProfileCommandValidator : AbstractValidator<UpsertLearnerProfileCommand>
{
    public UpsertLearnerProfileCommandValidator()
    {
        RuleFor(x => x.Goal)
            .MaximumLength(200).WithMessage("Goal must not exceed 200 characters.")
            .When(x => x.Goal != null);

        RuleFor(x => x.WeeklyHours)
            .InclusiveBetween(1, 100).WithMessage("WeeklyHours must be between 1 and 100.")
            .When(x => x.WeeklyHours.HasValue);
    }
}
