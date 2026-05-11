using FluentValidation;

namespace Edunary.Application.Quizzes.Commands.GenerateQuizQuestionsCommand;

public class GenerateQuizQuestionsCommandValidator : AbstractValidator<GenerateQuizQuestionsCommand>
{
    private static readonly HashSet<string> ValidTypes = new()
    {
        "SingleChoice", "MultipleChoice", "TrueFalse"
    };

    private static readonly HashSet<string> ValidDifficulties = new()
    {
        "Easy", "Medium", "Hard"
    };

    public GenerateQuizQuestionsCommandValidator()
    {
        RuleFor(x => x.CourseId)
            .GreaterThan(0).WithMessage("CourseId must be a positive integer.");

        RuleFor(x => x.RelatedItemId)
            .NotEmpty().WithMessage("RelatedItemId (the lecture to analyze) is required.");

        RuleFor(x => x.NumQuestions)
            .InclusiveBetween(1, 20)
            .WithMessage("NumQuestions must be between 1 and 20.");

        RuleFor(x => x.QuestionTypes)
            .NotEmpty().WithMessage("At least one question type must be selected.")
            .Must(types => types.All(t => ValidTypes.Contains(t)))
            .WithMessage($"Question types must be one of: {string.Join(", ", ValidTypes)}.");

        RuleFor(x => x.Difficulty)
            .Must(d => ValidDifficulties.Contains(d))
            .WithMessage($"Difficulty must be one of: {string.Join(", ", ValidDifficulties)}.");
    }
}
