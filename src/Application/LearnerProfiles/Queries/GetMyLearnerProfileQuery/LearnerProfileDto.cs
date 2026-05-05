namespace Edunary.Application.LearnerProfiles.Queries.GetMyLearnerProfileQuery;
public class LearnerProfileDto
{
    public string Goal { get; init; } = string.Empty;
    public string SkillLevel { get; init; } = string.Empty;
    public List<int> PreferredCategoryIds { get; init; } = new();
    public List<int> PreferredTopicIds { get; init; } = new();
    public int WeeklyHours { get; init; }
}
