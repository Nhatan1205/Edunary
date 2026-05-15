namespace Edunary.Application.Common.Interfaces;

public interface ICourseProgressCacheService
{
    Task CachePositionAsync(string userId, int courseId, string itemId,
        double lastPosition, CancellationToken ct = default);

#nullable enable
    Task<CachedProgressPositionData?> GetCachedPositionAsync(string userId, int courseId,
        string itemId, CancellationToken ct = default);
#nullable disable

    Task<List<CachedProgressPositionEntry>> GetAllDirtyEntriesAsync(CancellationToken ct = default);

    Task RemoveEntriesAsync(IEnumerable<string> keys, CancellationToken ct = default);

    Task RemoveSingleEntryAsync(string userId, int courseId, string itemId, CancellationToken ct = default);
}

public record CachedProgressPositionData(double LastPosition, long Timestamp);

public record CachedProgressPositionEntry(
    string RedisKey,
    string UserId,
    int CourseId,
    string ItemId,
    double LastPosition,
    long Timestamp);
