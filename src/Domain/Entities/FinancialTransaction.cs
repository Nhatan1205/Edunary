using Edunary.Domain.Enums;

namespace Edunary.Domain.Entities;

public class FinancialTransaction
{
    public Guid Id { get; set; }
    public LedgerTransactionType TransactionType { get; set; }
    public string ReferenceType { get; set; } = string.Empty;
    public string ReferenceId { get; set; } = string.Empty;
    public DateTimeOffset OccurredAt { get; set; }
    public DateTimeOffset PostedAt { get; set; }
    public string Currency { get; set; } = "USD";
    public decimal TotalAmount { get; set; }
    public LedgerTransactionStatus Status { get; set; }
    public Guid? ReversalOfId { get; set; }
    public string PostedBy { get; set; }

    public ICollection<FinancialEntry> Entries { get; set; } = new List<FinancialEntry>();
}
