namespace Edunary.Domain.Entities;

public class RatingCourse : BaseAuditableEntity
{
    public int CourseId { get; set; }
    public string UserId { get; set; }
    public int Rating { get; set; }
    public string Review { get; set; }

    // Navigation properties
    public Course Course { get; set; }
    public RatingResponse RatingResponse { get; set; }
}