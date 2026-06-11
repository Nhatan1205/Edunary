using Edunary.Application.Common.Interfaces;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Edunary.Infrastructure.HealthChecks;

public class StripeHealthCheck : IHealthCheck
{
    private readonly IPaymentService _paymentService;

    public StripeHealthCheck(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken ct = default)
    {
        var (isReachable, error) = await _paymentService.CheckConnectionAsync(ct);
        return isReachable
            ? HealthCheckResult.Healthy("Stripe is reachable")
            : HealthCheckResult.Unhealthy($"Stripe connection failed: {error}");
    }
}
