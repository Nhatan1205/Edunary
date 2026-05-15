using System.Text.Json;
using Edunary.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace Edunary.Application.Common.Behaviours;

public class CachingBehaviour<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : ICacheableQuery
{
    private readonly IQueryCacheService _cache;
    private readonly ILogger<CachingBehaviour<TRequest, TResponse>> _logger;

    public CachingBehaviour(IQueryCacheService cache, ILogger<CachingBehaviour<TRequest, TResponse>> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var cacheKey = request.CacheKey;

        // 1. Try to get from Redis
        var cachedJson = await _cache.GetAsync(cacheKey);
        if (cachedJson != null)
        {
            //_logger.LogInformation("Cache HIT: {CacheKey}", cacheKey);
            return JsonSerializer.Deserialize<TResponse>(cachedJson);
        }

        // 2. Cache miss — execute the actual handler
        //_logger.LogInformation("Cache MISS: {CacheKey}", cacheKey);
        var response = await next();

        // 3. Store in Redis for next requests
        await _cache.SetAsync(cacheKey, response, request.CacheDuration);

        return response;
    }
}
