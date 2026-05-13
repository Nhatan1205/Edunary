using Edunary.Domain.Enums;

namespace Edunary.Domain.Entities;

public class Coupon : BaseAuditableEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public CouponType Type { get; set; }
    public decimal DiscountValue { get; set; }

    public CouponScopeType ScopeType { get; set; }
    public int CourseId { get; set; }
    public string OwnerUserId { get; set; }

    public CouponFunderType FunderType { get; set; }

    public int MaxRedemptions { get; set; }
    public int RedemptionCount { get; set; }
    public int MaxRedemptionsPerUser { get; set; } = 1;

    public DateTimeOffset StartsAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<CouponRedemption> Redemptions { get; set; } = new List<CouponRedemption>();
}