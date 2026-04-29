namespace Edunary.Application.LearnerProfiles.Commands.UpsertLearnerProfileCommand;

public class UpsertLearnerProfileCommandValidator : AbstractValidator<UpsertLearnerProfileCommand>
{
    public UpsertLearnerProfileCommandValidator()
    {
        RuleFor(x => x.Goal)
            .MaximumLength(200).WithMessage("Goal must not exceed 200 characters.");

        RuleFor(x => x.WeeklyHours)
            .InclusiveBetween(0, 100).WithMessage("WeeklyHours must be between 0 and 100.");

        RuleFor(x => x.TimelineMonths)
            .GreaterThanOrEqualTo(0).WithMessage("TimelineMonths must be 0 or greater.");
    }
}
