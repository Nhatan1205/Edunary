using Edunary.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace Edunary.Infrastructure.Services;

public class ConnectionManagerService : IConnectionManagerService
{
    private readonly IRedisConnectionProvider _redis;
    private readonly ILogger<ConnectionManagerService> _logger;

    private static string BuildUserKey(string userId) => $"hub:user:{userId}";
    private static string BuildConnectionKey(string connId) => $"hub:conn:{connId}";

    private const string UsersKey = "hub:users";

    public ConnectionManagerService(IRedisConnectionProvider redis, ILogger<ConnectionManagerService> logger)
    {
        _redis = redis;
        _logger = logger;
    }

    public async Task AddConnectionAsync(string userId, string connectionId)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(connectionId))
        {
            return;
        }

        try
        {
            IDatabase db = _redis.GetDatabase();
            await db.StringSetAsync(BuildConnectionKey(connectionId), userId);
            await db.SetAddAsync(BuildUserKey(userId), connectionId);
            await db.SetAddAsync(UsersKey, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AddConnection failed. UserId={UserId} ConnId={ConnId}", userId, connectionId);
        }
    }

    public async Task RemoveConnectionAsync(string connectionId)
    {
        if (string.IsNullOrWhiteSpace(connectionId))
        {
            return;
        }

        try
        {
            IDatabase db = _redis.GetDatabase();

            RedisValue userId = await db.StringGetAsync(BuildConnectionKey(connectionId));
            if (userId.IsNullOrEmpty)
            {
                return;
            }

            await db.KeyDeleteAsync(BuildConnectionKey(connectionId));
            await db.SetRemoveAsync(BuildUserKey(userId.ToString()), connectionId);

            long remaining = await db.SetLengthAsync(BuildUserKey(userId.ToString()));
            if (remaining == 0)
            {
                await db.KeyDeleteAsync(BuildUserKey(userId.ToString()));
                await db.SetRemoveAsync(UsersKey, userId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "RemoveConnection failed. ConnId={ConnId}", connectionId);
        }
    }


    public async Task<bool> IsConnectedAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return false;
        }

        try
        {
            IDatabase db = _redis.GetDatabase();
            long count = await db.SetLengthAsync(BuildUserKey(userId));
            return count > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "IsConnected failed. UserId={UserId}", userId);
            return false;
        }
    }

    public async Task<long> GetOnlineCountAsync()
    {
        try
        {
            IDatabase db = _redis.GetDatabase();
            return await db.SetLengthAsync(UsersKey);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetOnlineCount failed");
            return 0;
        }
    }
}
