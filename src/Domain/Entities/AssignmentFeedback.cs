namespace Edunary.Domain.Entities;

public class AssignmentFeedback : BaseAuditableEntity
{
    public int AssignmentSubmissionId { get; set; }
    public string Content { get; set; }

    // Navigation properties
    public AssignmentSubmission AssignmentSubmission { get; set; } = null!;
}
