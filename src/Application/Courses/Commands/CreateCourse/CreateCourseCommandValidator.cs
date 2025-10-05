using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FluentValidation;

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
            .NotEmpty().WithMessage("Category is required.")
            .GreaterThan(0).WithMessage("CategoryId must be greater than 0.");

        RuleFor(c => c.Price)
            .NotEmpty().WithMessage("Price is required.")
            .GreaterThanOrEqualTo(0).WithMessage("Price must be 0 or greater.");
    }
}
