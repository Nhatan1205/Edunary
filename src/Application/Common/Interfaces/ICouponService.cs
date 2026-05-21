using Edunary.Application.Coupons.Models;

namespace Edunary.Application.Common.Interfaces;

public interface ICouponService
{
    Task<CouponApplicationResult> ValidateAndCalculateAsync(
        IList<CoursePaymentInfo> courses,
        string userId,
        string couponCode,
        CancellationToken cancellationToken = default);

    Task ReserveAsync(
        CouponApplicationResult result,
        int orderId,
        string userId,
        CancellationToken cancellationToken = default); // synchronous internally; returns Task for caller consistency

    Task ConsumeAsync(int orderId, CancellationToken cancellationToken = default);

    Task ReleaseAsync(int orderId, CancellationToken cancellationToken = default);
}
