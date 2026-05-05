using Edunary.Domain.Enums;
using FluentValidation;

namespace Edunary.Application.Quizzes.Commands.UpdateQuizQuestionsCommand;

public class UpdateQuizQuestionsCommandValidator : AbstractValidator<UpdateQuizQuestionsCommand>
{
    public UpdateQuizQuestionsCommandValidator()
    {
        RuleFor(x => x.QuizId).GreaterThan(0);
        RuleFor(x => x.Questions).NotNull();

        RuleForEach(x => x.Questions).ChildRules(q =>
        {
            q.RuleFor(x => x.Name).NotEmpty().MaximumLength(300);
            q.RuleFor(x => x.Explanation).MaximumLength(2000);
            q.RuleFor(x => x.Choices).NotNull();

            q.When(x => x.Type == QuestionType.SingleChoice, () =>
            {
                q.RuleFor(x => x.Choices).Must(c => c.Count >= 2)
                    .WithMessage("SingleChoice questions must have at least 2 choices.");
                q.RuleFor(x => x.Choices).Must(c => c.Count(ch => ch.IsCorrect) == 1)
                    .WithMessage("SingleChoice questions must have exactly 1 correct choice.");
            });

            q.When(x => x.Type == QuestionType.MultipleChoice, () =>
            {
                q.RuleFor(x => x.Choices).Must(c => c.Count >= 2)
                    .WithMessage("MultipleChoice questions must have at least 2 choices.");
                q.RuleFor(x => x.Choices).Must(c => c.Count(ch => ch.IsCorrect) >= 1)
                    .WithMessage("MultipleChoice questions must have at least 1 correct choice.");
            });

            q.When(x => x.Type == QuestionType.TrueFalse, () =>
            {
                q.RuleFor(x => x.Choices).Must(c => c.Count == 2)
                    .WithMessage("TrueFalse questions must have exactly 2 choices.");
                q.RuleFor(x => x.Choices).Must(c => c.Count(ch => ch.IsCorrect) == 1)
                    .WithMessage("TrueFalse questions must have exactly 1 correct choice.");
            });
        });
    }
}
