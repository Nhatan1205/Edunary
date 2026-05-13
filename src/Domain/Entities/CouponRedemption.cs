using Edunary.Domain.Enums;

namespace Edunary.Domain.Entities;

public class CouponRedemption : BaseAuditableEntity
{
    public int CouponId { get; set; }
    public Coupon Coupon { get; set; } = null!;

    public int OrderId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int CourseId { get; set; }

    public float DiscountAmount { get; set; }
    public CouponRedemptionStatus Status { get; set; } = CouponRedemptionStatus.Reserved;
    public DateTimeOffset RedeemedAt { get; set; }
}
