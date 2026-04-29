namespace Edunary.Application.Roadmaps.Queries.GetMyAIRoadmapsQuery;

public class MyAIRoadmapDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string SkillLevel { get; set; } = string.Empty;
    public int? UserRating { get; set; }
    public DateTimeOffset Created { get; set; }
}
