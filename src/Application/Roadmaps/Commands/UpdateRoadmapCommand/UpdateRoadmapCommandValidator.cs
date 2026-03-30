namespace Edunary.Application.Roadmaps.Commands.UpdateRoadmapCommand;

public class UpdateRoadmapCommandValidator : AbstractValidator<UpdateRoadmapCommand>
{
    public UpdateRoadmapCommandValidator()
    {
        RuleFor(c => c.Id)
            .GreaterThan(0).WithMessage("Roadmap Id is required.");

        RuleFor(c => c.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MinimumLength(5).WithMessage("Title must be at least 5 characters.")
            .MaximumLength(60).WithMessage("Title must not exceed 60 characters.");

        RuleFor(c => c.Subtitle)
            .MaximumLength(90).WithMessage("Subtitle must not exceed 90 characters.");

        RuleFor(c => c.RoadmapTopicId)
            .GreaterThan(0).WithMessage("RoadmapTopicId is required.");

        RuleFor(c => c.SkillLevel)
            .IsInEnum().WithMessage("SkillLevel must be a valid value (0-3).");
    }
}
