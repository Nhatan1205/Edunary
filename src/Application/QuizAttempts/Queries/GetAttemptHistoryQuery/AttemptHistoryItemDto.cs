namespace Edunary.Application.QuizAttempts.Queries.GetAttemptHistoryQuery;

public class AttemptHistoryItemDto
{
    public int AttemptId { get; set; }
    public int Score { get; set; }
    public bool IsPassed { get; set; }
    public bool IsActive { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? ExpiryTime { get; set; }
    public DateTimeOffset Completed { get; set; }
}
