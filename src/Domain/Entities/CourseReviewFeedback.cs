namespace Edunary.Domain.Entities;

public class CourseReviewFeedback : BaseAuditableEntity
{
    public int CourseReviewSubmissionId { get; set; }

    public ReviewFeedbackType FeedbackType { get; set; }

    public ReviewFeedbackCategory Category { get; set; }

    public string Content { get; set; }

    public bool IsResolved { get; set; }

    // Navigation properties
    public CourseReviewSubmission Submission { get; set; } = null!;
}
