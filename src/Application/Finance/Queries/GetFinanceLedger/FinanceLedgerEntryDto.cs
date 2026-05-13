namespace Edunary.Application.Finance.Queries.GetFinanceLedger;

public class FinanceLedgerEntryDto
{
    public int Id { get; init; }
    public Guid TransactionId { get; init; }
    public string TransactionType { get; init; }
    public string AccountCode { get; init; }
    public string Side { get; init; }
    public decimal Amount { get; init; }
    public string UserId { get; init; }
    public string Description { get; init; }
    public DateTimeOffset OccurredAt { get; init; }
    public string ReferenceType { get; init; }
    public string ReferenceId { get; init; }
    public string Currency { get; init; }
}
