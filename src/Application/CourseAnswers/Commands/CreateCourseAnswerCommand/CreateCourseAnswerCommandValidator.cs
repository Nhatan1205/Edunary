namespace Edunary.Application.CourseAnswers.Commands.CreateCourseAnswerCommand;

public class CreateCourseAnswerCommandValidator : AbstractValidator<CreateCourseAnswerCommand>
{
    public CreateCourseAnswerCommandValidator()
    {
        RuleFor(x => x.QuestionId)
            .GreaterThan(0).WithMessage("QuestionId is required.");

        RuleFor(x => x.Body)
            .NotEmpty().WithMessage("Answer body is required.");
    }
}
