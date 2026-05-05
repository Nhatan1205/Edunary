namespace Edunary.Domain.Entities;

public class QuizAttempt : BaseAuditableEntity
{
    public int QuizId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int QuizAttemptSnapshotId { get; set; }
    public int Score { get; set; }
    public bool IsPassed { get; set; }
    public bool IsActive { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? ExpiryTime { get; set; }

    // Navigation properties
    public Quiz Quiz { get; set; } = null!;
    public QuizAttemptSnapshot Snapshot { get; set; } = null!;
    public ICollection<QuizAttemptAnswer> Answers { get; set; } = new List<QuizAttemptAnswer>();
}
