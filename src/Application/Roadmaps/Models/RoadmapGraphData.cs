namespace Edunary.Application.Roadmaps.Models;
public class RoadmapGraphData
{
    public List<RoadmapNodeData> Nodes { get; set; } = new();

    public List<RoadmapEdgeData> Edges { get; set; } = new();
}
