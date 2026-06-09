using Edunary.Application.ServiceHealth.Queries.GetServiceHealthQuery;

namespace Edunary.Application.Common.Interfaces;

public interface IServiceHealthService
{
    Task<ServiceHealthDto> GetHealthAsync(CancellationToken ct = default);
}
