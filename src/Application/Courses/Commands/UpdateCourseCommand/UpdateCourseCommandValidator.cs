using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FluentValidation;

namespace Edunary.Application.Courses.Commands.UpdateCourse;
public class UpdateCourseCommandValidator : AbstractValidator<UpdateCourseCommand>
{
    public UpdateCourseCommandValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0)
            .WithMessage("Id must be greater than 0.");
        RuleFor(x => x.Title)
            .MinimumLength(5).WithMessage("Title must be at least 5 characters.")
            .MaximumLength(60).WithMessage("Title must not exceed 60 characters.");
        RuleFor(x => x.Subtitle)
            .MinimumLength(5).WithMessage("Subtitle must be at least 5 characters.")
            .MaximumLength(120).WithMessage("Subtitle must not exceed 120 characters.");
        RuleFor(x => x.Description)
            .MinimumLength(200).WithMessage("Description must be at least 200 characters.");
        RuleFor(x => x.Topic)
            .MaximumLength(100).WithMessage("Topic must not exceed 100 characters.");
        RuleFor(x => x.ImageUrl)
            .MinimumLength(5).WithMessage("ImageUrl must be at least 5 characters.");
        RuleFor(x => x.WelcomeMessage)
            .MaximumLength(500).WithMessage("Welcome message must not exceed 500 characters.");
        RuleFor(x => x.CongratulationsMessage)
            .MaximumLength(500).WithMessage("Congratulations message must not exceed 500 characters.");
        RuleFor(c => c.CategoryId)
           .GreaterThan(0).WithMessage("CategoryId must be greater than 0.");
        RuleFor(c => c.Price)
            .GreaterThanOrEqualTo(0).WithMessage("Price must be 0 or greater.");
    }
}
