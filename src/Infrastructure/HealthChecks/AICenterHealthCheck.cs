using Edunary.Application.SystemSettings.Queries.GetAIConfigQuery;
using MediatR;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Edunary.Infrastructure.HealthChecks;

public class AICenterHealthCheck : IHealthCheck
{
    private readonly ISender _sender;
    private readonly IHttpClientFactory _httpClientFactory;

    public AICenterHealthCheck(ISender sender, IHttpClientFactory httpClientFactory)
    {
        _sender = sender;
        _httpClientFactory = httpClientFactory;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken ct = default)
    {
        try
        {
            var aiConfig = await _sender.Send(new GetAIConfigQuery(), ct);

            if (string.IsNullOrWhiteSpace(aiConfig.AICenterBaseUrl))
                return HealthCheckResult.Unhealthy("AI Center base URL is not configured");

            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(5));

            var client = _httpClientFactory.CreateClient();
            // Any HTTP response (even 4xx) means the server is reachable
            var response = await client.GetAsync(aiConfig.AICenterBaseUrl, cts.Token);
            return HealthCheckResult.Healthy($"AI Center is reachable (HTTP {(int)response.StatusCode})");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("AI Center connection failed", ex);
        }
    }
}
