namespace Edunary.Application.Roadmaps.Commands.RateRoadmapCommand;

public class RateRoadmapCommandValidator : AbstractValidator<RateRoadmapCommand>
{
    public RateRoadmapCommandValidator()
    {
        RuleFor(x => x.RoadmapId)
            .GreaterThan(0).WithMessage("RoadmapId must be greater than 0.");

        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 2).WithMessage("Rating must be 1 (thumbs down) or 2 (thumbs up).");
    }
}
