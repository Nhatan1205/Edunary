namespace Edunary.Application.QuizAttempts.Commands.SubmitQuizAttemptCommand;

public class SubmitResultDto
{
    public int AttemptId { get; set; }
    public int Score { get; set; }
    public bool IsPassed { get; set; }
    public int CorrectCount { get; set; }
    public int TotalQuestions { get; set; }
    public double PassingScore { get; set; }
}
