namespace Edunary.Application.KnowledgeBase;

public class KnowledgeDocumentDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string Status { get; set; } = string.Empty;
    public int? ChunkCount { get; set; }
    public string ErrorMessage { get; set; }
    public string QdrantCollection { get; set; } = string.Empty;
    public DateTimeOffset Created { get; set; }
    public DateTimeOffset LastModified { get; set; }
}
