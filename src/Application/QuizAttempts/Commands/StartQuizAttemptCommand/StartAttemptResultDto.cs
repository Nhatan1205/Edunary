namespace Edunary.Application.QuizAttempts.Commands.StartQuizAttemptCommand;

public class StartAttemptResultDto
{
    public int AttemptId { get; set; }
    public int QuizId { get; set; }
    public string QuizTitle { get; set; } = string.Empty;
    public string QuizDescription { get; set; } = string.Empty;
    public int TimeLimitMinutes { get; set; }
    public double PassingScore { get; set; }
    public int MaxAttempts { get; set; }
    public int AttemptNumber { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? ExpiryTime { get; set; }
    public bool IsResumed { get; set; }
    public List<StudentQuestionDto> Questions { get; set; } = new();
}
