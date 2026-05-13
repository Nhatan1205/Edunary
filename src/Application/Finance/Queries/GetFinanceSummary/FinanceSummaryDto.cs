namespace Edunary.Application.Finance.Queries.GetFinanceSummary;

public class FinanceSummaryDto
{
    public decimal GrossSales { get; init; }
    public decimal VatCollected { get; init; }
    public decimal PlatformRevenue { get; init; }
    public decimal InstructorGrossEarnings { get; init; }
    public decimal InstructorNetEarnings { get; init; }
    public decimal WithholdingTax { get; init; }
    public decimal PendingPayouts { get; init; }
    public string Currency { get; init; } = "USD";
}
