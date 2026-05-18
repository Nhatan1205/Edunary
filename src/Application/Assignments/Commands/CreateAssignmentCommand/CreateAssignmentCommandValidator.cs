using FluentValidation;

namespace Edunary.Application.Assignments.Commands.CreateAssignmentCommand;

public class CreateAssignmentCommandValidator : AbstractValidator<CreateAssignmentCommand>
{
    public CreateAssignmentCommandValidator()
    {
        RuleFor(x => x.CourseId).GreaterThan(0).WithMessage("CourseId must be greater than 0.");
        RuleFor(x => x.ItemId).NotEmpty().MaximumLength(100).WithMessage("ItemId is required.");
        RuleFor(x => x.Title).NotEmpty().MaximumLength(300).WithMessage("Title is required.");
        RuleFor(x => x.Description).MaximumLength(2000).WithMessage("Description must not exceed 2000 characters.");
        RuleFor(x => x.Instructions).MaximumLength(5000).WithMessage("Instructions must not exceed 5000 characters.");
        RuleFor(x => x.EstimatedDurationMinutes).GreaterThanOrEqualTo(1).WithMessage("Estimated duration must be at least 1 minute.");
    }
}
