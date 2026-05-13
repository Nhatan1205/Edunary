using Edunary.Domain.Enums;

namespace Edunary.Application.Coupons.Models;

public class CouponApplicationResult
{
    public bool IsValid { get; set; }
    public string ErrorMessage { get; set; }
    public string CouponCode { get; set; } = string.Empty;
    public int CouponId { get; set; }
    public CouponFunderType FunderType { get; set; }
    public List<CouponItemDiscount> Items { get; set; } = new();
    public float TotalDiscountAmount { get; set; }
    public float DiscountedTotal { get; set; }
}
