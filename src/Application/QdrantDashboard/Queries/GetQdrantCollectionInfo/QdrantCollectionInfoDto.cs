#nullable enable

namespace Edunary.Application.QdrantDashboard.Queries.GetQdrantCollectionInfo;

public class QdrantCollectionInfoDto
{
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int PointsCount { get; set; }
    public int? VectorsCount { get; set; }
    public int? IndexedVectorsCount { get; set; }
    public int? SegmentsCount { get; set; }
    public VectorConfigDto? VectorConfig { get; set; }
    public OptimizerStatusDto? OptimizerStatus { get; set; }
    public Dictionary<string, string>? PayloadSchema { get; set; }
}
