namespace Edunary.Application.Roadmaps.Models;

/// <summary>Node returned by AI Center for a generated roadmap.</summary>
public class AiNodeResult
{
    public string ClientNodeId { get; set; } = string.Empty;
    public int CourseId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public double PositionX { get; set; }
    public double PositionY { get; set; }
    public int SortOrder { get; set; }
}

/// <summary>Edge returned by AI Center linking two nodes.</summary>
public class AiEdgeResult
{
    public string SourceNodeId { get; set; } = string.Empty;
    public string TargetNodeId { get; set; } = string.Empty;
}
