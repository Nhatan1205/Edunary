namespace Edunary.Domain.Entities;

public class QuizAttemptAnswer : BaseAuditableEntity
{
    public int QuizAttemptId { get; set; }
    public int SnapshotQuestionId { get; set; }
    public bool IsCorrect { get; set; }

    // Navigation properties
    public QuizAttempt QuizAttempt { get; set; } = null!;
    public ICollection<QuizAttemptAnswerChoice> AnswerChoices { get; set; } = new List<QuizAttemptAnswerChoice>();
}
