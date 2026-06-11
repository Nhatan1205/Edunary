using Edunary.Application.Common.Interfaces;
using Edunary.Application.ServiceHealth.Queries.GetServiceHealthQuery;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Edunary.Infrastructure.Services;

public class ServiceHealthService : IServiceHealthService
{
    private readonly HealthCheckService _healthCheckService;

    public ServiceHealthService(HealthCheckService healthCheckService)
    {
        _healthCheckService = healthCheckService;
    }

    public async Task<ServiceHealthDto> GetHealthAsync(CancellationToken ct = default)
    {
        var report = await _healthCheckService.CheckHealthAsync(ct);

        var services = report.Entries.Select(e => new ServiceHealthItemDto
        {
            Name        = e.Key,
            Status      = e.Value.Status.ToString(),
            DurationMs  = Math.Round(e.Value.Duration.TotalMilliseconds, 1),
            Description = e.Value.Description,
            Error       = e.Value.Exception?.Message,
            Tags        = e.Value.Tags,
        }).ToList();

        return new ServiceHealthDto
        {
            OverallStatus = report.Status.ToString(),
            CheckedAtUtc  = DateTime.UtcNow,
            Services      = services,
        };
    }
}
