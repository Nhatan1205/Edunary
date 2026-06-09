using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.ServiceHealth.Queries.GetServiceHealthQuery;

public record GetServiceHealthQuery : IRequest<ServiceHealthDto>;

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
