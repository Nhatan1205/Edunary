#nullable enable

namespace Edunary.Application.QdrantDashboard.Queries.GetQdrantPoints;

public class QdrantPointDto
{
    public string Id { get; set; } = string.Empty;
    public Dictionary<string, object>? Payload { get; set; }
}
