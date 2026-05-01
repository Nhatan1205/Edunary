using Edunary.Domain.Enums;

namespace Edunary.Application.Roadmaps.Commands.GenerateAIRoadmapCommand;

public class GenerateAIRoadmapCommandValidator : AbstractValidator<GenerateAIRoadmapCommand>
{
    public GenerateAIRoadmapCommandValidator()
    {
        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(1000);
    }
}
