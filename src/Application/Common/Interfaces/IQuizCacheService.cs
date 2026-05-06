namespace Edunary.Application.Common.Interfaces;

public interface IQuizCacheService
{
    Task CacheAnswerAsync(string userId, int attemptId, int quizId, int questionId, List<int> selectedAnswerIds, CancellationToken cancellationToken = default);
    Task<Dictionary<int, List<int>>> GetCachedAnswersAsync(string userId, int attemptId, int quizId, CancellationToken cancellationToken = default);
    Task ClearCacheAsync(string userId, int attemptId, int quizId, CancellationToken cancellationToken = default);
}
