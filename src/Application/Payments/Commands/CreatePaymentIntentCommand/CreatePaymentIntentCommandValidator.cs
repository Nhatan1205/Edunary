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
            .NotEmpty().WithMessage("Course ID cannot be empty.")
            .Must(BeAValidGuid).WithMessage("Course ID must be a valid GUID format.");
    }

    private static bool BeAValidGuid(string courseId)
    {
        return Guid.TryParse(courseId, out _) || int.TryParse(courseId, out _);
    }
}