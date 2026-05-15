using Edunary.Application.Common.Interfaces;
using Edunary.Application.CourseProgresses.Commands.UpdateCourseProgressCommand;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Edunary.Infrastructure.Services;

public class CourseProgressFlushService : ICourseProgressFlushService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ICourseProgressCacheService _cacheService;
    private readonly ILogger<CourseProgressFlushService> _logger;

    private static readonly JsonSerializerOptions ReadOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private static readonly JsonSerializerOptions WriteOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public CourseProgressFlushService(
        IServiceScopeFactory scopeFactory,
        ICourseProgressCacheService cacheService,
        ILogger<CourseProgressFlushService> logger)
    {
        _scopeFactory = scopeFactory;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task FlushCachedProgressAsync(CancellationToken ct = default)
    {
        List<CachedProgressPositionEntry> entries = await _cacheService.GetAllDirtyEntriesAsync(ct);

        if (entries.Count == 0) return;

        _logger.LogInformation("Flushing {Count} cached progress entries from Redis to DB.", entries.Count);

        IEnumerable<IGrouping<(string UserId, int CourseId), CachedProgressPositionEntry>> groups
            = entries.GroupBy(e => (e.UserId, e.CourseId));

        List<string> flushedKeys = new();

        using IServiceScope scope = _scopeFactory.CreateScope();
        IApplicationDbContext context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        foreach (IGrouping<(string UserId, int CourseId), CachedProgressPositionEntry> group in groups)
        {
            try
            {
                var courseProgress = await context.CourseProgress
                    .FirstOrDefaultAsync(
                        p => p.CourseId == group.Key.CourseId && p.StudentId == group.Key.UserId,
                        ct);

                if (courseProgress == null)
                {
                    _logger.LogWarning("CourseProgress not found during flush. UserId={UserId}, CourseId={CourseId}",
                        group.Key.UserId, group.Key.CourseId);
                    flushedKeys.AddRange(group.Select(e => e.RedisKey));
                    continue;
                }

                CourseContentSchema progressData = JsonSerializer.Deserialize<CourseContentSchema>(
                    courseProgress.Progress, ReadOptions);

                Dictionary<string, CachedProgressPositionEntry> latestByItem = group
                    .GroupBy(e => e.ItemId)
                    .ToDictionary(g => g.Key, g => g.OrderByDescending(e => e.Timestamp).First());

                string latestItemId = latestByItem.Values
                    .OrderByDescending(e => e.Timestamp)
                    .First().ItemId;

                foreach (SectionSchema section in progressData.Contents)
                {
                    if (section.Items == null) continue;
                    foreach (ItemSchema item in section.Items)
                    {
                        if (latestByItem.TryGetValue(item.ItemId, out CachedProgressPositionEntry entry))
                        {
                            item.LastPosition = entry.LastPosition;
                        }
                    }
                }

                progressData.LastAccessedItemId = latestItemId;

                courseProgress.Progress = JsonSerializer.Serialize(progressData, WriteOptions);
                flushedKeys.AddRange(group.Select(e => e.RedisKey));

                _logger.LogDebug("Flushed progress for UserId={UserId}, CourseId={CourseId}, Items={ItemCount}",
                    group.Key.UserId, group.Key.CourseId, latestByItem.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to flush progress for UserId={UserId}, CourseId={CourseId}.",
                    group.Key.UserId, group.Key.CourseId);
            }
        }

        if (flushedKeys.Count > 0)
        {
            await context.SaveChangesAsync(ct);
            await _cacheService.RemoveEntriesAsync(flushedKeys, ct);
            _logger.LogInformation("Successfully flushed {Count} progress entries to DB.", flushedKeys.Count);
        }
    }
}
