#nullable enable
using Edunary.Domain.Enums;

namespace Edunary.Application.InstructorWallets.Queries.GetWithdrawalRequestsForAdmin;

public class AdminWithdrawalRequestDto
{
    public int Id { get; set; }
    public DateTimeOffset Created { get; set; }

    public string InstructorId { get; set; } = string.Empty;
    public string InstructorName { get; set; } = string.Empty;
    public string InstructorEmail { get; set; } = string.Empty;

    public decimal Amount { get; set; }
    public decimal WithholdingAmount { get; set; }
    public decimal NetAmount { get; set; }
    public decimal WithholdingRate { get; set; }
    public string? TaxCountryCode { get; set; }
    public string Currency { get; set; } = string.Empty;

    public string Bank { get; set; } = string.Empty;
    public string BankNumber { get; set; } = string.Empty;
    public string BankAccountHolder { get; set; } = string.Empty;

    public InstructorWalletTransactionStatus Status { get; set; }
}
