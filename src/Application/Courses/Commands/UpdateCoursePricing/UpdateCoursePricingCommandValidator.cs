using FluentValidation;

namespace Edunary.Application.Courses.Commands.UpdateCoursePricing;

public class UpdateCoursePricingCommandValidator : AbstractValidator<UpdateCoursePricingCommand>
{
    public UpdateCoursePricingCommandValidator()
    {
        RuleFor(c => c.CourseId)
            .GreaterThan(0).WithMessage("Course ID is invalid.");

        RuleFor(c => c.Price)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Price cannot be negative.");

        RuleFor(c => c.Price)
            .Must(price => price == 0 || price >= 9.99f)
            .WithMessage("Paid course price must be at least $9.99. Set price to $0 for a free course.");

        RuleFor(c => c.Price)
            .LessThanOrEqualTo(299.99f)
            .WithMessage("Course price cannot exceed $299.99.");
    }
}
