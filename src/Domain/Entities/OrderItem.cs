using Edunary.Domain.Enums;

namespace Edunary.Domain.Entities;

public class OrderItem : BaseEntity
{
    public int OrderId { get; set; }
    public int CourseId { get; set; }
    public string CourseName { get; set; } = string.Empty;
    public float Price { get; set; }
    public float OriginalPrice { get; set; }
    public float DiscountAmount { get; set; }
    public int AppliedCouponId { get; set; }
    public float VatAmount { get; set; }
    public SalesChannel SalesChannel { get; set; }

    // Navigation property
    public Order Order { get; set; } = null!;
}