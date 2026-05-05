namespace Edunary.Domain.Entities;

public class QuizAttemptAnswerChoice : BaseAuditableEntity
{
    public int QuizAttemptAnswerId { get; set; }
    public int ChoiceId { get; set; }

    // Navigation properties
    public QuizAttemptAnswer QuizAttemptAnswer { get; set; } = null!;
}
