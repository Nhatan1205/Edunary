namespace Edunary.Application.Common.Interfaces;

public interface IKnowledgeBaseJobService
{
    void EnqueueDocumentIngestion(int documentId);
    Task ProcessDocumentIngestionAsync(int documentId);

    void EnqueueDocumentDeletion(int documentId);
    Task ProcessDocumentDeletionAsync(int documentId);
}
