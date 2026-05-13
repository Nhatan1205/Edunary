namespace Edunary.Application.Coupons.Models;

public class CouponItemDiscount
{
    public int CourseId { get; set; }
    public float OriginalPrice { get; set; }
    public float DiscountedPrice { get; set; }
    public float DiscountAmount { get; set; }
}
