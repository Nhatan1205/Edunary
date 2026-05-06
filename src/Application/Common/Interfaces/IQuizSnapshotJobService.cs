namespace Edunary.Application.Common.Interfaces;

public interface IQuizSnapshotJobService
{
    /// <summary>Enqueues a Hangfire background job to create the snapshot. Call this from Application commands.</summary>
    void EnqueueSnapshotCreation(int quizId);

    /// <summary>The actual snapshot logic executed by Hangfire. Do not call this directly.</summary>
    Task CreateSnapshotAsync(int quizId, CancellationToken cancellationToken = default);
}
