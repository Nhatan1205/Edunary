namespace Edunary.Application.CourseQuestions.Commands.CreateCourseQuestionCommand;

public class CreateCourseQuestionCommandValidator : AbstractValidator<CreateCourseQuestionCommand>
{
    public CreateCourseQuestionCommandValidator()
    {
        RuleFor(x => x.CourseId)
            .GreaterThan(0).WithMessage("CourseId is required.");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(300).WithMessage("Title must not exceed 255 characters.");
    }
}
