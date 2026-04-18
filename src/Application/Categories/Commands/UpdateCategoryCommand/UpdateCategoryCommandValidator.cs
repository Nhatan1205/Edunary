namespace Edunary.Application.Categories.Commands.UpdateCategoryCommand;

public class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
{
    public UpdateCategoryCommandValidator()
    {
        RuleFor(c => c.Id)
            .GreaterThan(0).WithMessage("Id must be greater than 0.");

        RuleFor(c => c.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MinimumLength(2).WithMessage("Title must be at least 2 characters.")
            .MaximumLength(100).WithMessage("Title must not exceed 100 characters.");
    }
}
