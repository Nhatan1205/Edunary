namespace Edunary.Application.Quizzes.Commands.UpdateQuizQuestionsCommand;

public record ChoiceDto
{
    public int? Id { get; init; }
    public string Text { get; init; } = string.Empty;
    public bool IsCorrect { get; init; }
    public int SortOrder { get; init; }
}
