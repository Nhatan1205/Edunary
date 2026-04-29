namespace Edunary.Application.Topics.Commands.UpdateTopicCommand;
public class UpdateTopicCommandValidator : AbstractValidator<UpdateTopicCommand>
{
    public UpdateTopicCommandValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("Id must be greater than 0.");
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Topic name is required.")
            .MinimumLength(2).WithMessage("Topic name must be at least 2 characters.")
            .MaximumLength(100).WithMessage("Topic name must not exceed 100 characters.");
    }
}
