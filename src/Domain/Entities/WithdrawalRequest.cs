#nullable enable
using Edunary.Domain.Enums;

namespace Edunary.Domain.Entities;

public class WithdrawalRequest : BaseAuditableEntity
{
    public int InstructorWalletId { get; set; }
    public InstructorWallet InstructorWallet { get; set; } = null!;

    public decimal Amount { get; set; }
    public decimal WithholdingRate { get; set; }
    public decimal WithholdingAmount { get; set; }
    public decimal NetAmount { get; set; }
    public string? TaxCountryCode { get; set; }
    public string Currency { get; set; } = string.Empty;

    public string Bank { get; set; } = string.Empty;
    public string BankNumber { get; set; } = string.Empty;
    public string BankAccountHolder { get; set; } = string.Empty;

    public InstructorWalletTransactionStatus Status { get; set; } = InstructorWalletTransactionStatus.Processing;
}
