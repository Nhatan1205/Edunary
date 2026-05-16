namespace Edunary.Domain.Entities;

public class Assignment : BaseAuditableEntity
{
    public string Title { get; set; }
    public string Description { get; set; }
    public string Instructions { get; set; }
    public int EstimatedDurationMinutes { get; set; }
    public int CourseId { get; set; }
    public string ItemId { get; set; } = string.Empty;
    public bool IsPublished { get; set; }

    // Navigation properties
    public Course Course { get; set; } = null!;
    public ICollection<AssignmentQuestion> Questions { get; set; } = new List<AssignmentQuestion>();
    public ICollection<AssignmentSubmission> Submissions { get; set; } = new List<AssignmentSubmission>();
}
