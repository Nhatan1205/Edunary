namespace Edunary.Application.Topics.Commands.CreateTopicCommand;
public class CreateTopicCommandValidator : AbstractValidator<CreateTopicCommand>
{
    public CreateTopicCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Topic name is required.")
            .MinimumLength(2).WithMessage("Topic name must be at least 2 characters.")
            .MaximumLength(100).WithMessage("Topic name must not exceed 100 characters.");
    }
}
