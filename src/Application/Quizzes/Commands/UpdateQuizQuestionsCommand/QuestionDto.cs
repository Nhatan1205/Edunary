using Edunary.Domain.Enums;

namespace Edunary.Application.Quizzes.Commands.UpdateQuizQuestionsCommand;

public record QuestionDto
{
    public int? Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public QuestionType Type { get; init; }
    public string Explanation { get; init; } = string.Empty;
    public int SortOrder { get; init; }
    public List<ChoiceDto> Choices { get; init; } = new();
}
