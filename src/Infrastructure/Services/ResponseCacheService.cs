using System.Text.Json;
using Edunary.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace Edunary.Infrastructure.Services;

public class ResponseCacheService : IResponseCacheService
{
    private readonly IRedisConnectionProvider _redis;
    private readonly ILogger<ResponseCacheService> _logger;

    public ResponseCacheService(IRedisConnectionProvider redis, ILogger<ResponseCacheService> logger)
    {
        _redis = redis;
        _logger = logger;
    }

    public async Task<string> GetAsync(string key)
    {
        try
        {
            var db = _redis.GetDatabase();
            var value = await db.StringGetAsync(key);
            return value.IsNullOrEmpty ? null : value.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis GET failed for key: {Key}. Falling back to database.", key);
            return null;
        }
    }

    public async Task SetAsync(string key, object value, TimeSpan duration)
    {
        try
        {
            var db = _redis.GetDatabase();
            var json = JsonSerializer.Serialize(value);
            await db.StringSetAsync(key, json, duration);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis SET failed for key: {Key}. Cache skipped.", key);
        }
    }

    public async Task RemoveAsync(string key)
    {
        try
        {
            var db = _redis.GetDatabase();
            await db.KeyDeleteAsync(key);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis DELETE failed for key: {Key}.", key);
        }
    }
}
