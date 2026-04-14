namespace Edunary.Application.SystemSettings.Commands.UpdateSystemSettingsCommand;

public class UpdateSystemSettingsCommandValidator : AbstractValidator<UpdateSystemSettingsCommand>
{
    public UpdateSystemSettingsCommandValidator()
    {
        RuleFor(c => c.Settings)
            .NotEmpty().WithMessage("Settings list cannot be empty.");

        RuleForEach(c => c.Settings).ChildRules(setting =>
        {
            setting.RuleFor(s => s.Key)
                .NotEmpty().WithMessage("Setting key is required.");

            setting.RuleFor(s => s.Value)
                .MaximumLength(2000).WithMessage("Value must not exceed 2000 characters.");
        });
    }
}
