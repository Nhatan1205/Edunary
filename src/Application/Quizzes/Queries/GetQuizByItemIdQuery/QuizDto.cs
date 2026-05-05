namespace Edunary.Application.Quizzes.Queries.GetQuizByItemIdQuery;

public class QuizDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CourseId { get; set; }
    public string ItemId { get; set; } = string.Empty;
#nullable enable
    public string? RelatedItemId { get; set; }
#nullable disable
    public bool IsBeingConvertToSnapshot { get; set; }
    public int TimeLimitMinutes { get; set; }
    public double PassingScore { get; set; }
    public int MaxAttempts { get; set; }
    public bool ShowCorrectAnswers { get; set; }
    public bool RandomizeQuestions { get; set; }
    public List<QuizQuestionDto> Questions { get; set; } = new();
}
