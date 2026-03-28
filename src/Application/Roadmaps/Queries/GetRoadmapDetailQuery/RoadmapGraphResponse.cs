using Edunary.Application.Roadmaps.Models;

namespace Edunary.Application.Roadmaps.Queries.GetRoadmapDetailQuery;

public class RoadmapGraphResponse
{
    public List<RoadmapNodeResponse> Nodes { get; set; } = new();

    public List<RoadmapEdgeData> Edges { get; set; } = new();
}

public class RoadmapNodeResponse
{
    public string ClientNodeId { get; set; }

    public CourseNodeDto Course { get; set; }

    public double PositionX { get; set; }

    public double PositionY { get; set; }

    public int SortOrder { get; set; }
}


public class CourseNodeDto
{
    public int CourseId { get; set; }

    public string Title { get; set; }

    public string ImageUrl { get; set; }

    public int TotalStudents { get; set; }

    public double Ratings { get; set; }
}

