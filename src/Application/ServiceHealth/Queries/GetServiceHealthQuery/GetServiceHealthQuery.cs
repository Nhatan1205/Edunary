using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.ServiceHealth.Queries.GetServiceHealthQuery;

public record GetServiceHealthQuery : IRequest<ServiceHealthDto>, ICacheableQuery
{
    // No parameters → a single fixed key shared by every admin and web instance (Redis).
    public string CacheKey => "service-health";
    public TimeSpan CacheDuration => TimeSpan.FromSeconds(60);
}

public class GetServiceHealthQueryHandler : IRequestHandler<GetServiceHealthQuery, ServiceHealthDto>
{
    private readonly IServiceHealthService _serviceHealthService;

    public GetServiceHealthQueryHandler(IServiceHealthService serviceHealthService)
    {
        _serviceHealthService = serviceHealthService;
    }

    public Task<ServiceHealthDto> Handle(GetServiceHealthQuery request, CancellationToken ct)
        => _serviceHealthService.GetHealthAsync(ct);
}
