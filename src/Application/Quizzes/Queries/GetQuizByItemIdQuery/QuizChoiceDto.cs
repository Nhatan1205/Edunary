namespace Edunary.Application.Quizzes.Queries.GetQuizByItemIdQuery;

public class QuizChoiceDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int SortOrder { get; set; }
}
