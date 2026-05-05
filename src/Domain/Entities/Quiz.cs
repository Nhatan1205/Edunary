namespace Edunary.Domain.Entities;

public class Quiz : BaseAuditableEntity
{
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
    // Navigation properties
    public Course Course { get; set; } = null!;
    public ICollection<Question> Questions { get; set; } = new List<Question>();
    public ICollection<QuizAttemptSnapshot> Snapshots { get; set; } = new List<QuizAttemptSnapshot>();
    public ICollection<QuizAttempt> Attempts { get; set; } = new List<QuizAttempt>();
}
