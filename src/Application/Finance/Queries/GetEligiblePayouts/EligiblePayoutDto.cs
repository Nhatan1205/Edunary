namespace Edunary.Application.Finance.Queries.GetEligiblePayouts;

public class EligiblePayoutDto
{
    public string InstructorId { get; init; }
    public string InstructorName { get; init; }
    public string InstructorEmail { get; init; }
    public decimal NetBalance { get; init; }
    public string Currency { get; init; } = "USD";
    public bool HasPayoutAccount { get; init; }
    public bool HasInstructorWallet { get; init; }
    public bool HasProcessingWithdrawal { get; init; }
    public decimal WithholdingRate { get; init; }
    public decimal WithholdingAmount { get; init; }
    public decimal EstimatedNetAmount { get; init; }
    public bool IsBatchReady { get; init; }
    public List<string> BlockingReasons { get; init; } = new();
}
