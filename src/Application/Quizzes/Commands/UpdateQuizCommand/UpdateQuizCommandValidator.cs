using FluentValidation;

namespace Edunary.Application.Quizzes.Commands.UpdateQuizCommand;

public class UpdateQuizCommandValidator : AbstractValidator<UpdateQuizCommand>
{
    public UpdateQuizCommandValidator()
    {
        RuleFor(x => x.QuizId).GreaterThan(0);
        RuleFor(x => x.Title).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Description).MaximumLength(2000);
        RuleFor(x => x.TimeLimitMinutes).GreaterThanOrEqualTo(0);
        RuleFor(x => x.PassingScore).InclusiveBetween(0, 100);
        RuleFor(x => x.MaxAttempts).GreaterThanOrEqualTo(0);
    }
}
