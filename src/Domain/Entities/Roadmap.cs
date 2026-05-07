namespace Edunary.Domain.Entities;
public class Roadmap : BaseAuditableEntity
{
    public string Title { get; set; }

    public string Subtitle { get; set; }

    public string Description { get; set; }

    public CourseLevel Level { get; set; }

    public bool IsPublic { get; set; } = false;

    public string GraphData { get; set; }

    public int RoadmapTopicId { get; set; }

    public RoadmapSource Source { get; set; } = RoadmapSource.Manual;

    // Navigation Properties

    public RoadmapTopic RoadmapTopic { get; set; } = null!;
}
