namespace Edunary.Domain.Entities;

public class InstructorWallet : BaseAuditableEntity
{
    public string InstructorId { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public decimal TotalWithdrawn { get; set; }

    public IList<InstructorWalletTransaction> Transactions { get; set; } = new List<InstructorWalletTransaction>();
    public IList<WithdrawalRequest> WithdrawalRequests { get; set; } = new List<WithdrawalRequest>();
}
