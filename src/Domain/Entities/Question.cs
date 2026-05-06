namespace Edunary.Domain.Entities;

public class Question : BaseAuditableEntity
{
    public int QuizId { get; set; }
    public string Name { get; set; } = string.Empty;
    public QuestionType Type { get; set; }
    public string Explanation { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    // Navigation properties
    public Quiz Quiz { get; set; } = null!;
    public ICollection<Choice> Choices { get; set; } = new List<Choice>();
}
