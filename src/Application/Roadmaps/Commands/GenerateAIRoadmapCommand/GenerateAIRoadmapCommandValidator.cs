namespace Edunary.Application.Roadmaps.Commands.GenerateAIRoadmapCommand;

public class GenerateAIRoadmapCommandValidator : AbstractValidator<GenerateAIRoadmapCommand>
{
    public GenerateAIRoadmapCommandValidator()
    {
        RuleFor(x => x.Topic)
            .NotEmpty().WithMessage("Topic is required.")
            .MaximumLength(200).WithMessage("Topic must not exceed 200 characters.");

        RuleFor(x => x.Level)
            .NotEmpty().WithMessage("Level is required.")
            .Must(level => new[] { "Beginner", "Intermediate", "Advanced", "AllLevel" }.Contains(level))
            .WithMessage("Level must be one of: Beginner, Intermediate, Advanced, AllLevel.");
    }
}
