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

    // Navigation property
    public IList<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}