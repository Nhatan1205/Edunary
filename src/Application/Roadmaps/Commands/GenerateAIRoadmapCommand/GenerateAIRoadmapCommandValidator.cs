using Edunary.Domain.Enums;

namespace Edunary.Application.Roadmaps.Commands.GenerateAIRoadmapCommand;

public class GenerateAIRoadmapCommandValidator : AbstractValidator<GenerateAIRoadmapCommand>
{
    public GenerateAIRoadmapCommandValidator()
    {
        RuleFor(x => x.Goal)
            .NotEmpty().WithMessage("Goal is required.")
            .MaximumLength(200).WithMessage("Goal must not exceed 200 characters.");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("CategoryId must be greater than 0.");

        RuleFor(x => x.RoadmapTopicId)
            .GreaterThan(0).WithMessage("RoadmapTopicId must be greater than 0.");

        RuleFor(x => x.Level)
            .IsInEnum().WithMessage("Level must be a valid CourseLevel value.");

        RuleFor(x => x.WeeklyHours)
            .InclusiveBetween(1, 100).WithMessage("WeeklyHours must be between 1 and 100.");

        RuleFor(x => x.TimelineMonths)
            .GreaterThanOrEqualTo(0).WithMessage("TimelineMonths must be 0 or greater.");
    }
}
