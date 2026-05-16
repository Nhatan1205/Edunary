using Edunary.Domain.Enums;

namespace Edunary.Domain.Entities;

public class AssignmentSubmission : BaseAuditableEntity
{
    public int AssignmentId { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public AssignmentSubmissionStatus Status { get; set; }
    public string Answers { get; set; } = string.Empty;

    // Navigation properties
    public Assignment Assignment { get; set; } = null!;
    public ICollection<AssignmentFeedback> Feedbacks { get; set; } = new List<AssignmentFeedback>();
}
