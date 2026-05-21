using Edunary.Domain.Enums;

namespace Edunary.Domain.Entities;

public class Order : BaseAuditableEntity
{
    public string UserId { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public float TotalAmount { get; set; }
    public string PaymentIntentId { get; set; } = string.Empty;
    public OrderStatus Status { get; set; }
    public DateTime OrderDate { get; set; }
    public DateTime? CompletedDate { get; set; }

    public string CouponCode { get; set; }
    public float DiscountAmount { get; set; }
    public float OriginalAmount { get; set; }

    public string BillingCountryCode { get; set; } = string.Empty;
    public float VatAmount { get; set; }
    public float VatRate { get; set; }

    // Navigation properties
    public IList<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public IList<Payment> Payments { get; set; } = new List<Payment>();
}