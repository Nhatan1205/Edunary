using Edunary.Domain.Enums;

namespace Edunary.Application.Coupons.Queries.GetCoupons;

public class CouponDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public CouponType Type { get; set; }
    public decimal DiscountValue { get; set; }
    public CouponScopeType ScopeType { get; set; }
    public int CourseId { get; set; }
    public string OwnerUserId { get; set; } = string.Empty;
    public string OwnerFullName { get; set; } = string.Empty;
    public string OwnerEmail { get; set; } = string.Empty;
    public CouponFunderType FunderType { get; set; }
    public int MaxRedemptions { get; set; }
    public int RedemptionCount { get; set; }
    public int MaxRedemptionsPerUser { get; set; }
    public DateTimeOffset StartsAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset Created { get; set; }
}
