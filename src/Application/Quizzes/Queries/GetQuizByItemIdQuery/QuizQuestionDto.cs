namespace Edunary.Application.Quizzes.Queries.GetQuizByItemIdQuery;

public class QuizQuestionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public List<QuizChoiceDto> Choices { get; set; } = new();
}
