using FluentValidation;

namespace Edunary.Application.DirectMessages.Commands.SendMessageCommand;

public class SendMessageCommandValidator : AbstractValidator<SendMessageCommand>
{
    public SendMessageCommandValidator()
    {
        RuleFor(v => v.ConversationId)
            .GreaterThan(0).WithMessage("ConversationId must be greater than 0.");

        RuleFor(v => v.Content)
            .NotEmpty().WithMessage("Message content cannot be empty.");
    }
}
