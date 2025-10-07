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
            .MaximumLength(30).WithMessage("Subtitle must not exceed 30 characters.");
        RuleFor(x => x.Description)
            .MinimumLength(5).WithMessage("Description must be at least 5 characters.")
            .MaximumLength(10000).WithMessage("Description must not exceed 2000 characters.");
        RuleFor(x => x.LearningObjectives)
            .MinimumLength(5).WithMessage("Description must be at least 5 characters.")
            .MaximumLength(1000).WithMessage("Learning objectives must not exceed 1000 characters.");
        RuleFor(x => x.Topic)
            .MinimumLength(5).WithMessage("Description must be at least 5 characters.")
            .MaximumLength(100).WithMessage("Topic must not exceed 100 characters.");
        RuleFor(x => x.Requirements)
            .MinimumLength(5).WithMessage("Title must be at least 5 characters.")
            .MaximumLength(1000).WithMessage("Requirements must not exceed 1000 characters.");
        RuleFor(x => x.TargetAudience)
            .MinimumLength(5).WithMessage("Title must be at least 5 characters.")
            .MaximumLength(500).WithMessage("Target audience must not exceed 500 characters.");
        RuleFor(x => x.ImageUrl)
            .MinimumLength(5).WithMessage("Title must be at least 5 characters.")
            .MaximumLength(500).WithMessage("Image URL must not exceed 500 characters.");
        RuleFor(x => x.WelcomeMessage)
            .MinimumLength(5).WithMessage("Title must be at least 5 characters.")
            .MaximumLength(500).WithMessage("Welcome message must not exceed 500 characters.");
        RuleFor(x => x.CongratulationsMessage)
            .MinimumLength(5).WithMessage("Title must be at least 5 characters.")
            .MaximumLength(500).WithMessage("Congratulations message must not exceed 500 characters.");
        RuleFor(c => c.CategoryId)
           .GreaterThan(0).WithMessage("CategoryId must be greater than 0.");
        RuleFor(c => c.Price)
            .GreaterThanOrEqualTo(0).WithMessage("Price must be 0 or greater.");
    }
}
