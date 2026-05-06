using Edunary.Application.Roadmaps.Models;

namespace Edunary.Application.Roadmaps.Queries.GetRoadmapDetailQuery;

public class RoadmapDetailDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Subtitle { get; set; }
    public string Description { get; set; }
    public int RoadmapTopicId { get; set; }
    public string TopicTitle { get; set; }
    public string Level { get; set; }
    public bool IsPublic { get; set; }
    public DateTimeOffset Created { get; set; }
    public int NodeCount { get; set; }
    public RoadmapGraphResponse GraphData { get; set; }
}
