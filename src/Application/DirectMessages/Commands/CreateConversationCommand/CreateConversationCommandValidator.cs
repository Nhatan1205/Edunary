using FluentValidation;

namespace Edunary.Application.DirectMessages.Commands.CreateConversationCommand;

public class CreateConversationCommandValidator : AbstractValidator<CreateConversationCommand>
{
    public CreateConversationCommandValidator()
    {
        RuleFor(v => v.TargetUserId)
            .NotEmpty().WithMessage("Target user ID is required.");
    }
}
