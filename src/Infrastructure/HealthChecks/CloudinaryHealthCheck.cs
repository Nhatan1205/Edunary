using Edunary.Application.Common.Interfaces;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Edunary.Infrastructure.HealthChecks;

public class CloudinaryHealthCheck : IHealthCheck
{
    private readonly IUploadFileService _uploadFileService;

    public CloudinaryHealthCheck(IUploadFileService uploadFileService)
    {
        _uploadFileService = uploadFileService;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken ct = default)
    {
        var (isReachable, error) = await _uploadFileService.CheckCloudinaryConnectionAsync(ct);
        return isReachable
            ? HealthCheckResult.Healthy("Cloudinary is reachable")
            : HealthCheckResult.Unhealthy($"Cloudinary connection failed: {error}");
    }
}
