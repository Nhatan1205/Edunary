using Edunary.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.Text.Json;

namespace Edunary.Infrastructure.Services;

public class QuizCacheService : IQuizCacheService
{
    private readonly IRedisConnectionProvider _redisService;
    private readonly ILogger<QuizCacheService> _logger;
    private static readonly TimeSpan DefaultTtl = TimeSpan.FromHours(24);

    public QuizCacheService(IRedisConnectionProvider redisService, ILogger<QuizCacheService> logger)
    {
        _redisService = redisService;
        _logger = logger;
    }

    private static string BuildKey(string userId, int attemptId, int quizId)
        => $"quiz:answers:{userId}:{attemptId}:{quizId}";

    public async Task CacheAnswerAsync(string userId, int attemptId, int quizId, int questionId, List<int> selectedAnswerIds, CancellationToken cancellationToken = default)
    {
        try
        {
            IDatabase db = _redisService.GetDatabase();
            string key = BuildKey(userId, attemptId, quizId);
            string value = JsonSerializer.Serialize(selectedAnswerIds);

            await db.HashSetAsync(key, questionId.ToString(), value);
            await db.KeyExpireAsync(key, DefaultTtl);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to cache quiz answer. UserId={UserId}, AttemptId={AttemptId}, QuizId={QuizId}, QuestionId={QuestionId}",
                userId, attemptId, quizId, questionId);
        }
    }

    public async Task<Dictionary<int, List<int>>> GetCachedAnswersAsync(string userId, int attemptId, int quizId, CancellationToken cancellationToken = default)
    {
        Dictionary<int, List<int>> result = new();
        try
        {
            IDatabase db = _redisService.GetDatabase();
            string key = BuildKey(userId, attemptId, quizId);
            HashEntry[] entries = await db.HashGetAllAsync(key);

            foreach (HashEntry entry in entries)
            {
                if (int.TryParse(entry.Name, out int questionId))
                {
                    List<int> choices = JsonSerializer.Deserialize<List<int>>(entry.Value!) ?? new List<int>();
                    result[questionId] = choices;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get cached quiz answers. UserId={UserId}, AttemptId={AttemptId}, QuizId={QuizId}",
                userId, attemptId, quizId);
        }

        return result;
    }

    public async Task ClearCacheAsync(string userId, int attemptId, int quizId, CancellationToken cancellationToken = default)
    {
        try
        {
            IDatabase db = _redisService.GetDatabase();
            string key = BuildKey(userId, attemptId, quizId);
            await db.KeyDeleteAsync(key);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to clear quiz cache. UserId={UserId}, AttemptId={AttemptId}, QuizId={QuizId}",
                userId, attemptId, quizId);
        }
    }
}
