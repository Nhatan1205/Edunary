namespace Edunary.Domain.Entities;

public class AnswerUpvote : BaseAuditableEntity
{
    public int AnswerId { get; set; }

    public string VoterId { get; set; }

    // Navigation
    public CourseAnswer Answer { get; set; }
}
