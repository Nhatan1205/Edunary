namespace Edunary.Domain.Entities;

public class AssignmentQuestion : BaseAuditableEntity
{
    public int AssignmentId { get; set; }
    public string QuestionText { get; set; }
    public string ExampleAnswer { get; set; }
    public int SortOrder { get; set; }

    // Navigation properties
    public Assignment Assignment { get; set; } = null!;
}
