namespace Edunary.Domain.Enums;

public enum LedgerTransactionType
{
    OrderPaid,
    OrderRefunded,
    PayoutInitiated,
    PayoutCompleted,
    WithholdingTaxAccrued,
    VatAccrued,
    TaxRemitted,
    Adjustment
}
