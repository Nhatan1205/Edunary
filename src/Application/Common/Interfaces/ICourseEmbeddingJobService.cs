namespace Edunary.Application.Common.Interfaces;

public interface ICourseEmbeddingJobService
{
    void EnqueueCourseEmbedding(int courseId);
    Task ProcessCourseEmbeddingAsync(int courseId);
    void EnqueueCourseEmbeddingDeletion(int courseId);
    Task ProcessCourseEmbeddingDeletionAsync(int courseId);
    void EnqueueBatchCourseEmbedding(string userId);
    Task ProcessBatchCourseEmbeddingAsync(string userId);
}
