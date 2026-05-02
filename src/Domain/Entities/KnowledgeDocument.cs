using Edunary.Domain.Enums;

namespace Edunary.Domain.Entities;

public class KnowledgeDocument : BaseAuditableEntity
{
    public string FileName { get; set; } = string.Empty;
    public string FileKey { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public KnowledgeDocumentStatus Status { get; set; } = KnowledgeDocumentStatus.Pending;
    public int? ChunkCount { get; set; }
#nullable enable
    public string? ErrorMessage { get; set; }
    public string QdrantCollection { get; set; } = "edunary_docs";
}
