namespace Edunary.Domain.Entities;

public class QuestionUpvote : BaseAuditableEntity
{
    public int QuestionId { get; set; }

    public string VoterId { get; set; }

    // Navigation
    public CourseQuestion Question { get; set; }
}
