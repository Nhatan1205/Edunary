namespace Edunary.Application.Common.Interfaces;

public interface IQuizGenerationJobService
{
    /// <summary>Enqueues a Hangfire background job to generate quiz questions. Call from Application commands.</summary>
    void EnqueueQuizGeneration(
        string userId,
        int courseId,
        string itemId,
        string relatedItemId,
        int numQuestions,
        List<string> questionTypes,
        string difficulty,
        string promptDescription);

    /// <summary>The actual generation logic executed by Hangfire. Do not call directly.</summary>
    Task ProcessQuizGenerationAsync(
        string userId,
        int courseId,
        string itemId,
        string relatedItemId,
        int numQuestions,
        List<string> questionTypes,
        string difficulty,
        string promptDescription);
}
