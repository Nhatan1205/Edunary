
namespace Edunary.Application.QdrantDashboard.Queries.GetQdrantCollections;

public class CollectionSummaryDto
{
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int PointsCount { get; set; }
    public int? VectorsCount { get; set; }
    public int? VectorSize { get; set; }
    #nullable enable
    public string? Distance { get; set; }
    public int? SegmentsCount { get; set; }
}
