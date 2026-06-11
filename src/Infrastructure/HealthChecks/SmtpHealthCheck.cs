using Edunary.Application.Common.Interfaces;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Edunary.Infrastructure.HealthChecks;

public class SmtpHealthCheck : IHealthCheck
{
    private readonly IEmailService _emailService;

    public SmtpHealthCheck(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken ct = default)
    {
        var (isReachable, error) = await _emailService.CheckConnectionAsync(ct);
        return isReachable
            ? HealthCheckResult.Healthy("SMTP server is reachable")
            : HealthCheckResult.Unhealthy($"SMTP connection failed: {error}");
    }
}
