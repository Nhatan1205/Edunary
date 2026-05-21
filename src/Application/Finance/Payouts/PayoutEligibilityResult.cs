using Edunary.Application.Finance.Queries.GetEligiblePayouts;

namespace Edunary.Application.Finance.Payouts;

public class PayoutEligibilityResult
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

    public int? InstructorWalletId { get; init; }
    public string Bank { get; init; }
    public string BankNumber { get; init; }
    public string BankAccountHolder { get; init; }
    public string TaxCountryCode { get; init; }

    public EligiblePayoutDto ToDto()
    {
        return new EligiblePayoutDto
        {
            InstructorId = InstructorId,
            InstructorName = InstructorName,
            InstructorEmail = InstructorEmail,
            NetBalance = NetBalance,
            Currency = Currency,
            HasPayoutAccount = HasPayoutAccount,
            HasInstructorWallet = HasInstructorWallet,
            HasProcessingWithdrawal = HasProcessingWithdrawal,
            WithholdingRate = WithholdingRate,
            WithholdingAmount = WithholdingAmount,
            EstimatedNetAmount = EstimatedNetAmount,
            IsBatchReady = IsBatchReady,
            BlockingReasons = BlockingReasons
        };
    }
}
