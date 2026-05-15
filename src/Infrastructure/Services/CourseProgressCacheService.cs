using Edunary.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.Text.Json;

namespace Edunary.Infrastructure.Services;

public class CourseProgressCacheService : ICourseProgressCacheService
{
    private readonly IRedisConnectionProvider _redisService;
    private readonly ILogger<CourseProgressCacheService> _logger;
    private const string KeyPrefix = "cp:pos:";
    private static readonly TimeSpan DefaultTtl = TimeSpan.FromHours(2);

    public CourseProgressCacheService(IRedisConnectionProvider redisService, ILogger<CourseProgressCacheService> logger)
    {
        _redisService = redisService;
        _logger = logger;
    }

    private static string BuildKey(string userId, int courseId, string itemId)
        => $"{KeyPrefix}{userId}:{courseId}:{itemId}";

    public async Task CachePositionAsync(string userId, int courseId, string itemId,
        double lastPosition, CancellationToken ct = default)
    {
        try
        {
            IDatabase db = _redisService.GetDatabase();
            string key = BuildKey(userId, courseId, itemId);
            long timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            string value = JsonSerializer.Serialize(new { lastPosition, timestamp });

            await db.StringSetAsync(key, value, DefaultTtl);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to cache progress position. UserId={UserId}, CourseId={CourseId}, ItemId={ItemId}",
                userId, courseId, itemId);
        }
    }

#nullable enable
    public async Task<CachedProgressPositionData?> GetCachedPositionAsync(string userId, int courseId,
        string itemId, CancellationToken ct = default)
    {
        try
        {
            IDatabase db = _redisService.GetDatabase();
            string key = BuildKey(userId, courseId, itemId);
            RedisValue value = await db.StringGetAsync(key);

            if (!value.HasValue) return null;

            using JsonDocument doc = JsonDocument.Parse(value.ToString());
            JsonElement root = doc.RootElement;
            double lastPosition = root.GetProperty("lastPosition").GetDouble();
            long timestamp = root.GetProperty("timestamp").GetInt64();

            return new CachedProgressPositionData(lastPosition, timestamp);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get cached progress position. UserId={UserId}, CourseId={CourseId}, ItemId={ItemId}",
                userId, courseId, itemId);
            return null;
        }
    }
#nullable disable

    public async Task<List<CachedProgressPositionEntry>> GetAllDirtyEntriesAsync(CancellationToken ct = default)
    {
        List<CachedProgressPositionEntry> result = new();

        try
        {
            IDatabase db = _redisService.GetDatabase();
            IServer server = _redisService.GetDatabase().Multiplexer.GetServer(
                _redisService.GetDatabase().Multiplexer.GetEndPoints()[0]);

            await foreach (RedisKey redisKey in server.KeysAsync(pattern: $"{KeyPrefix}*"))
            {
                string key = redisKey.ToString();
                try
                {
                    RedisValue value = await db.StringGetAsync(key);
                    if (!value.HasValue) continue;

                    string withoutPrefix = key[KeyPrefix.Length..];
                    int firstColon = withoutPrefix.IndexOf(':');
                    int secondColon = withoutPrefix.IndexOf(':', firstColon + 1);
                    if (firstColon == -1 || secondColon == -1) continue;

                    string userId = withoutPrefix[..firstColon];
                    string courseIdStr = withoutPrefix[(firstColon + 1)..secondColon];
                    string itemId = withoutPrefix[(secondColon + 1)..];

                    if (!int.TryParse(courseIdStr, out int courseId)) continue;

                    using JsonDocument doc = JsonDocument.Parse(value.ToString());
                    JsonElement root = doc.RootElement;
                    double lastPosition = root.GetProperty("lastPosition").GetDouble();
                    long timestamp = root.GetProperty("timestamp").GetInt64();

                    result.Add(new CachedProgressPositionEntry(key, userId, courseId, itemId, lastPosition, timestamp));
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to parse cached progress entry. Key={Key}", key);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to scan dirty progress entries from Redis.");
        }

        return result;
    }

    public async Task RemoveEntriesAsync(IEnumerable<string> keys, CancellationToken ct = default)
    {
        try
        {
            IDatabase db = _redisService.GetDatabase();
            RedisKey[] redisKeys = keys.Select(k => (RedisKey)k).ToArray();
            if (redisKeys.Length > 0)
            {
                await db.KeyDeleteAsync(redisKeys);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to remove cached progress entries from Redis.");
        }
    }

    public async Task RemoveSingleEntryAsync(string userId, int courseId, string itemId, CancellationToken ct = default)
    {
        try
        {
            IDatabase db = _redisService.GetDatabase();
            string key = BuildKey(userId, courseId, itemId);
            await db.KeyDeleteAsync(key);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to remove single cached progress entry. UserId={UserId}, CourseId={CourseId}, ItemId={ItemId}",
                userId, courseId, itemId);
        }
    }
}
