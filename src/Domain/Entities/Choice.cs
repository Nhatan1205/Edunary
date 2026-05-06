namespace Edunary.Domain.Entities;

public class Choice : BaseAuditableEntity
{
    public int QuestionId { get; set; }
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int SortOrder { get; set; }

    // Navigation properties
    public Question Question { get; set; } = null!;
}
