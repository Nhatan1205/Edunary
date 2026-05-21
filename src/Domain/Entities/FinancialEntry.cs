using Edunary.Domain.Enums;

namespace Edunary.Domain.Entities;

public class FinancialEntry
{
    public int Id { get; set; }
    public Guid TransactionId { get; set; }
    public string AccountCode { get; set; } = string.Empty;
    public EntrySide Side { get; set; }
    public decimal Amount { get; set; }
    public string UserId { get; set; }
    public string Description { get; set; } = string.Empty;
    public int EntryOrder { get; set; }

    public FinancialTransaction Transaction { get; set; } = null!;
    public FinancialAccount Account { get; set; } = null!;
}
