using Edunary.Infrastructure.Services;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Edunary.Infrastructure.HealthChecks;

public class RedisHealthCheck : IHealthCheck
{
    private readonly IRedisConnectionProvider _redis;

    public RedisHealthCheck(IRedisConnectionProvider redis)
    {
        _redis = redis;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken ct = default)
    {
        try
        {
            var db = _redis.GetDatabase();
            await db.PingAsync();
            return HealthCheckResult.Healthy("Redis is reachable");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Redis connection failed", ex);
        }
    }
}
