namespace Edunary.Domain.Entities;

public class CourseApprovedSnapshot : BaseAuditableEntity
{
    public int CourseId { get; set; }

    public int CourseReviewSubmissionId { get; set; }

    public string Title { get; set; }

    public string Subtitle { get; set; }

    public string Description { get; set; }

    public CourseLevel Level { get; set; }

    public string LearningObjectives { get; set; }

    public string Requirements { get; set; }

    public string TargetAudience { get; set; }

    public string ImageUrl { get; set; }

    public string WelcomeMessage { get; set; }

    public string CongratulationsMessage { get; set; }

    public float Price { get; set; }

    public int CategoryId { get; set; }

    public bool AllowPlatformCoupons { get; set; }

    public string Content { get; set; }

    public string TopicIds { get; set; }

    public string MediaFilesJson { get; set; }

    public string QuizzesJson { get; set; }

    public string AssignmentsJson { get; set; }

    // Navigation properties
    public Course Course { get; set; } = null!;

    public CourseReviewSubmission Submission { get; set; } = null!;
}
