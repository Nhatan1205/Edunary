namespace Edunary.Domain.Entities;

public class LearnerProfile : BaseAuditableEntity
{
    public string StudentId { get; set; } = string.Empty;
    public string Goal { get; set; } = string.Empty;         
    public string SkillLevel { get; set; } = string.Empty;   
    public string KnownSkills { get; set; } = string.Empty;
    public string Interests { get; set; } = string.Empty;             
    public string PreferredCategoryIds { get; set; } = string.Empty;
    public string PreferredTopicIds { get; set; } = string.Empty;
    public int WeeklyHours { get; set; }
    public int TimelineMonths { get; set; }
}
