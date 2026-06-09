using Edunary.Application.Common.Interfaces;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Edunary.Infrastructure.HealthChecks;

public class SpacesStorageHealthCheck : IHealthCheck
{
    private readonly IUploadFileService _uploadFileService;

    public SpacesStorageHealthCheck(IUploadFileService uploadFileService)
    {
        _uploadFileService = uploadFileService;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken ct = default)
    {
        var (isReachable, error) = await _uploadFileService.CheckSpacesConnectionAsync(ct);
        return isReachable
            ? HealthCheckResult.Healthy("DigitalOcean Spaces is reachable")
            : HealthCheckResult.Unhealthy($"DigitalOcean Spaces connection failed: {error}");
    }
}
