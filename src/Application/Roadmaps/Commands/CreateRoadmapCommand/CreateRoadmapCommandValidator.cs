namespace Edunary.Application.Roadmaps.Commands.CreateRoadmapCommand;
public class CreateRoadmapCommandValidator : AbstractValidator<CreateRoadmapCommand>
{
    public CreateRoadmapCommandValidator()
    {
        RuleFor(c => c.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MinimumLength(5).WithMessage("Title must be at least 5 characters.")
            .MaximumLength(60).WithMessage("Maximum length is 60 characters.");

        RuleFor(c => c.Subtitle)
            .MaximumLength(90).WithMessage("Subtitle maximum length is 90 characters.");

        RuleFor(c => c.RoadmapTopicId)
            .GreaterThan(0).WithMessage("RoadmapTopicId must be greater than 0.");

        RuleFor(c => c.SkillLevel)
            .IsInEnum().WithMessage("SkillLevel must be a valid CourseLevel value.");
    }
}
