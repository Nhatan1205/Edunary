using Edunary.Application.Notifications.Commands.UpdateNotificationIsReadCommand;

public class UpdateNotificationStatusCommandValidator : AbstractValidator<UpdateNotificationStatusCommand>
{
    public UpdateNotificationStatusCommandValidator()
    {
        RuleFor(x => x.Ids)
            .NotNull()
            .NotEmpty();
    }
}
