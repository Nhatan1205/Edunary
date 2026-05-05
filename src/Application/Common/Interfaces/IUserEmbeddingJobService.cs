namespace Edunary.Application.Common.Interfaces;

public interface IUserEmbeddingJobService
{
    void EnqueueUserProfileEmbedding(string userId);
    Task ProcessUserProfileEmbeddingAsync(string userId);
    void EnqueueBatchUserProfileEmbedding();
    Task ProcessBatchUserProfileEmbeddingAsync();
}
