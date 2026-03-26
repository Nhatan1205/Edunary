namespace Edunary.Domain.Entities;
public class RoadmapTopic : BaseAuditableEntity
{
    public string Title { get; set; }

    // Navigation Properties
    public ICollection<Roadmap> Roadmaps { get; set; } = new List<Roadmap>();
}
