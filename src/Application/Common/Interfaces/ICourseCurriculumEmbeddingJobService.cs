namespace Edunary.Application.Common.Interfaces;

public interface ICourseCurriculumEmbeddingJobService
{
    void EnqueueCurriculumEmbedding(int courseId);
    Task ProcessCurriculumEmbeddingAsync(int courseId);
    void EnqueueCurriculumEmbeddingDeletion(int courseId);
    Task ProcessCurriculumEmbeddingDeletionAsync(int courseId);
    void EnqueueBatchCurriculumEmbedding();
    Task ProcessBatchCurriculumEmbeddingAsync();
}
