namespace Edunary.Application.QuizAttempts.Queries.GetAttemptResultQuery;

public class AttemptResultDto
{
    public int AttemptId { get; set; }
    public int QuizId { get; set; }
    public string QuizTitle { get; set; } = string.Empty;
    public int Score { get; set; }
    public bool IsPassed { get; set; }
    public int CorrectCount { get; set; }
    public int TotalQuestions { get; set; }
    public double PassingScore { get; set; }
    public bool ShowCorrectAnswers { get; set; }
    public List<AttemptQuestionResultDto> Questions { get; set; } = new();
}
