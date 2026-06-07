namespace Edunary.Application.Courses.Commands.CreateCourse;
public class CreateCourseCommandValidator : AbstractValidator<CreateCourseCommand>
{
    public CreateCourseCommandValidator()
    {
        RuleFor(c => c.Title)
                .NotEmpty().WithMessage("Title is required.")
                .MinimumLength(5).WithMessage("Title must be at least 5 characters.")
                .MaximumLength(60).WithMessage("Maximum length is 60 characters."); 

        RuleFor(c => c.CategoryId)
            .GreaterThan(0).WithMessage("CategoryId must be greater than 0.");

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
