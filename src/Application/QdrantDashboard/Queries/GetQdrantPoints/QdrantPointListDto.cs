#nullable enable

namespace Edunary.Application.QdrantDashboard.Queries.GetQdrantPoints;

public class QdrantPointListDto
{
    public List<QdrantPointDto> Points { get; set; } = new();
    public string? NextOffset { get; set; }
    public int? Total { get; set; }
}
