namespace Edunary.Application.Finance.Queries.GetRevenueTrend;

public class RevenueTrendDto
{
    public string Period { get; set; } = "";
    public List<string> Labels { get; set; } = new();
    public List<decimal> GrossSales { get; set; } = new();
    public List<decimal> PlatformRevenue { get; set; } = new();
    public List<int> OrderCount { get; set; } = new();
}
