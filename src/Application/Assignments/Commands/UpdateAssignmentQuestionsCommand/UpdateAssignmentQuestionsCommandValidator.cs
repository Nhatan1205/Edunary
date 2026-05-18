using FluentValidation;

namespace Edunary.Application.Assignments.Commands.UpdateAssignmentQuestionsCommand;

public class UpdateAssignmentQuestionsCommandValidator : AbstractValidator<UpdateAssignmentQuestionsCommand>
{
    public UpdateAssignmentQuestionsCommandValidator()
    {
        RuleFor(x => x.AssignmentId).GreaterThan(0).WithMessage("AssignmentId must be greater than 0.");
        RuleForEach(x => x.Questions).ChildRules(q =>
        {
            q.RuleFor(x => x.QuestionText).NotEmpty().MaximumLength(2000).WithMessage("Question text is required.");
            q.RuleFor(x => x.ExampleAnswer).MaximumLength(5000).WithMessage("Example answer must not exceed 5000 characters.");
        });
    }
}
