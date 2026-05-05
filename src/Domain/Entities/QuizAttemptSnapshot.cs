namespace Edunary.Domain.Entities;

public class QuizAttemptSnapshot : BaseAuditableEntity
{
    public int QuizId { get; set; }
    public string QuizQuestions { get; set; } = string.Empty;

    // Navigation properties
    public Quiz Quiz { get; set; } = null!;
    public ICollection<QuizAttempt> Attempts { get; set; } = new List<QuizAttempt>();
}
