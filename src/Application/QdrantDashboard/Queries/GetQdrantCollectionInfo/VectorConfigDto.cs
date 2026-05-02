#nullable enable

namespace Edunary.Application.QdrantDashboard.Queries.GetQdrantCollectionInfo;

public class VectorConfigDto
{
    public int? Size { get; set; }
    public string? Distance { get; set; }
    public bool? OnDisk { get; set; }
}
