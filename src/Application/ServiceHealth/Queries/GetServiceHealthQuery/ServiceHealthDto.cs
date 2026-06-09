#nullable enable
namespace Edunary.Application.ServiceHealth.Queries.GetServiceHealthQuery;

public class ServiceHealthDto
{
    public string OverallStatus { get; set; } = "Healthy";
    public DateTime CheckedAtUtc { get; set; }
    public List<ServiceHealthItemDto> Services { get; set; } = new();
}

public class ServiceHealthItemDto
{
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = "Healthy";
    public double DurationMs { get; set; }
    public string? Description { get; set; }
    public string? Error { get; set; }
    public IEnumerable<string> Tags { get; set; } = Enumerable.Empty<string>();
}
