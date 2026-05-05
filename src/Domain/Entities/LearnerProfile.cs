namespace Edunary.Domain.Entities;

public class LearnerProfile : BaseAuditableEntity
{
    public string StudentId { get; set; }
    public string Goal { get; set; }
    public string SkillLevel { get; set; }
    public string PreferredCategoryIds { get; set; }
    public string PreferredTopicIds { get; set; }
    public int WeeklyHours { get; set; }
}
