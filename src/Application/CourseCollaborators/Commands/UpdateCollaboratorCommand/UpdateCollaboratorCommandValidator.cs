using FluentValidation;

namespace Edunary.Application.CourseCollaborators.Commands.UpdateCollaboratorCommand;

public class UpdateCollaboratorCommandValidator : AbstractValidator<UpdateCollaboratorCommand>
{
    public UpdateCollaboratorCommandValidator()
    {
        RuleFor(x => x.CollaboratorId).GreaterThan(0);
        RuleFor(x => x.CourseId).GreaterThan(0);
        RuleFor(x => x.RevenueSharePercent).InclusiveBetween(0, 100);
    }
}
