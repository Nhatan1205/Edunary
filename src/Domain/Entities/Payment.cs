using Edunary.Domain.Enums;

namespace Edunary.Domain.Entities;

public class Payment : BaseAuditableEntity
{
    public string OrderId { get; set; } = string.Empty;
    public string PaymentIntentId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public PaymentStatus Status { get; set; }
    public DateTime PaidDate { get; set; }
}