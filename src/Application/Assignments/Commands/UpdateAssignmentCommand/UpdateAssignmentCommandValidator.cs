using FluentValidation;

namespace Edunary.Application.Assignments.Commands.UpdateAssignmentCommand;

public class UpdateAssignmentCommandValidator : AbstractValidator<UpdateAssignmentCommand>
{
    public UpdateAssignmentCommandValidator()
    {
        RuleFor(x => x.AssignmentId).GreaterThan(0).WithMessage("AssignmentId must be greater than 0.");
        RuleFor(x => x.Title).NotEmpty().MaximumLength(300).WithMessage("Title is required.");
        RuleFor(x => x.Description).MaximumLength(2000).WithMessage("Description must not exceed 2000 characters.");
        RuleFor(x => x.Instructions).MaximumLength(5000).WithMessage("Instructions must not exceed 5000 characters.");
        RuleFor(x => x.EstimatedDurationMinutes).GreaterThanOrEqualTo(1).WithMessage("Estimated duration must be at least 1 minute.");
    }
}
