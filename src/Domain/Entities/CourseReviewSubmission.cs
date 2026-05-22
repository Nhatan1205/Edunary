namespace Edunary.Domain.Entities;

public class CourseReviewSubmission : BaseAuditableEntity
{
    public int CourseId { get; set; }

    public string ReviewedByAdminId { get; set; }

    public ReviewSubmissionStatus Status { get; set; }

    public DateTimeOffset? ReviewedAt { get; set; }

    public string AdminNote { get; set; }

    public int SubmissionNumber { get; set; }

    // Navigation properties
    public Course Course { get; set; } = null!;

    public ICollection<CourseReviewFeedback> Feedbacks { get; set; } = new List<CourseReviewFeedback>();
}
