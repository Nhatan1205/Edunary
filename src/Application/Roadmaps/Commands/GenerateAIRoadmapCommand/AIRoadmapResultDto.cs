namespace Edunary.Application.Roadmaps.Commands.GenerateAIRoadmapCommand;

/// <summary>
/// AI trả về cấu trúc tương tự RoadmapGraphData,
/// nhưng node chứa label + description thay vì courseId
/// (vì AI generate topic, chưa có course thật trong DB).
/// </summary>
public class AIRoadmapResultDto
{
    public List<AIRoadmapNodeDto> Nodes { get; set; } = new();
    public List<AIRoadmapEdgeDto> Edges { get; set; } = new();
}

public class AIRoadmapNodeDto
{
    public string ClientNodeId { get; set; } = "";
    public string Label { get; set; } = "";          // Tên topic do AI generate
    public string Description { get; set; } = "";     // Mô tả ngắn
    public double PositionX { get; set; }
    public double PositionY { get; set; }
    public int SortOrder { get; set; }
}

public class AIRoadmapEdgeDto
{
    public string SourceNodeId { get; set; } = "";
    public string TargetNodeId { get; set; } = "";
}
