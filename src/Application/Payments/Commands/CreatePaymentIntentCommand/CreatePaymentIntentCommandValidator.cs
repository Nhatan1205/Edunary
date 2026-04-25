using FluentValidation;

namespace Edunary.Application.Payments.Commands.CreatePaymentIntentCommand;

public class CreatePaymentIntentCommandValidator : AbstractValidator<CreatePaymentIntentCommand>
{
    public CreatePaymentIntentCommandValidator()
    {
        RuleFor(c => c.CourseIds)
            .NotEmpty().WithMessage("At least one course ID is required.")
            .Must(courseIds => courseIds.Count > 0).WithMessage("At least one course ID is required.");

        RuleForEach(c => c.CourseIds)
            .GreaterThan(0)
            .WithMessage("Course ID must be greater than 0.");
    }
}