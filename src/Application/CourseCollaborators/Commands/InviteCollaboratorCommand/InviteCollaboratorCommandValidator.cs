using FluentValidation;

namespace Edunary.Application.CourseCollaborators.Commands.InviteCollaboratorCommand;

public class InviteCollaboratorCommandValidator : AbstractValidator<InviteCollaboratorCommand>
{
    public InviteCollaboratorCommandValidator()
    {
        RuleFor(x => x.CourseId).GreaterThan(0);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.RevenueSharePercent).InclusiveBetween(0, 100);
    }
}
