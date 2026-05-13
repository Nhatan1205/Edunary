using Edunary.Domain.Enums;

namespace Edunary.Application.Finance.Models;

public class LedgerPosting
{
    public LedgerTransactionType TransactionType { get; set; }
    public string ReferenceType { get; set; } = string.Empty;
    public string ReferenceId { get; set; } = string.Empty;
    public string Currency { get; set; } = "USD";
    public DateTimeOffset OccurredAt { get; set; } = DateTimeOffset.UtcNow;
    public List<LedgerEntryInput> Entries { get; set; } = new();
}

public class LedgerEntryInput
{
    public string AccountCode { get; set; } = string.Empty;
    public EntrySide Side { get; set; }
    public decimal Amount { get; set; }
    public string UserId { get; set; }
    public string Description { get; set; } = string.Empty;
}
