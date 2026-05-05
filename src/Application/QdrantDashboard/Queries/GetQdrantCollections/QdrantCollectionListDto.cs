namespace Edunary.Application.QdrantDashboard.Queries.GetQdrantCollections;

public class QdrantCollectionListDto
{
    public List<CollectionSummaryDto> Collections { get; set; } = new();
    public int Total { get; set; }
}
