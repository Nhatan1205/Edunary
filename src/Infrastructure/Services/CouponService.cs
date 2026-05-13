using Edunary.Application.Common.Interfaces;
using Edunary.Application.Coupons.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Infrastructure.Services;

public class CouponService : ICouponService
{
    private readonly IApplicationDbContext _context;

    public CouponService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CouponApplicationResult> ValidateAndCalculateAsync(
        IList<CoursePaymentInfo> courses,
        string userId,
        string couponCode,
        CancellationToken cancellationToken = default)
    {
        var code = couponCode.ToUpperInvariant();

        var coupon = await _context.Coupons
            .FirstOrDefaultAsync(c => c.Code == code, cancellationToken);

        if (coupon == null)
            return Invalid("Coupon not found");

        if (!coupon.IsActive)
            return Invalid("Coupon is no longer active");

        var now = DateTimeOffset.UtcNow;
        if (now < coupon.StartsAt)
            return Invalid("Coupon is not yet valid");

        if (now > coupon.ExpiresAt)
            return Invalid("Coupon has expired");

        if (coupon.MaxRedemptions > 0 && coupon.RedemptionCount >= coupon.MaxRedemptions)
            return Invalid("Coupon has reached its redemption limit");

        // Per-user limit check
        var userRedemptionCount = await _context.CouponRedemptions
            .CountAsync(r => r.CouponId == coupon.Id
                && r.UserId == userId
                && r.Status == CouponRedemptionStatus.Consumed, cancellationToken);

        if (userRedemptionCount >= coupon.MaxRedemptionsPerUser)
            return Invalid("You have already used this coupon");

        // Scope validation — filter applicable courses
        var applicableCourseIds = await GetApplicableCourseIdsAsync(coupon, courses, cancellationToken);

        if (!applicableCourseIds.Any())
            return Invalid("This coupon is not valid for the selected courses");

        // Calculate per-item discounts
        var items = new List<CouponItemDiscount>();
        float totalDiscount = 0;
        float discountedTotal = 0;

        foreach (var course in courses)
        {
            var originalPrice = (float)course.Price;
            var courseId = int.Parse(course.Id);

            float discountedPrice;
            float discountAmount;

            if (applicableCourseIds.Contains(courseId))
            {
                (discountedPrice, discountAmount) = ApplyDiscount(coupon, originalPrice);
            }
            else
            {
                discountedPrice = originalPrice;
                discountAmount = 0;
            }

            totalDiscount += discountAmount;
            discountedTotal += discountedPrice;

            items.Add(new CouponItemDiscount
            {
                CourseId = courseId,
                OriginalPrice = originalPrice,
                DiscountedPrice = discountedPrice,
                DiscountAmount = discountAmount
            });
        }

        return new CouponApplicationResult
        {
            IsValid = true,
            CouponCode = coupon.Code,
            CouponId = coupon.Id,
            FunderType = coupon.FunderType,
            Items = items,
            TotalDiscountAmount = totalDiscount,
            DiscountedTotal = discountedTotal
        };
    }

    public Task ReserveAsync(
        CouponApplicationResult result,
        int orderId,
        string userId,
        CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;

        foreach (var item in result.Items.Where(i => i.DiscountAmount > 0))
        {
            _context.CouponRedemptions.Add(new CouponRedemption
            {
                CouponId = result.CouponId,
                OrderId = orderId,
                UserId = userId,
                CourseId = item.CourseId,
                DiscountAmount = item.DiscountAmount,
                Status = CouponRedemptionStatus.Reserved,
                RedeemedAt = now
            });
        }

        return Task.CompletedTask;
    }

    public async Task ConsumeAsync(int orderId, CancellationToken cancellationToken = default)
    {
        var reservations = await _context.CouponRedemptions
            .Where(r => r.OrderId == orderId && r.Status == CouponRedemptionStatus.Reserved)
            .ToListAsync(cancellationToken);

        if (!reservations.Any())
            return;

        foreach (var r in reservations)
            r.Status = CouponRedemptionStatus.Consumed;

        // Increment usage counter
        var couponId = reservations[0].CouponId;
        var coupon = await _context.Coupons.FindAsync(new object[] { couponId }, cancellationToken);
        if (coupon != null)
            coupon.RedemptionCount += 1;
    }

    public async Task ReleaseAsync(int orderId, CancellationToken cancellationToken = default)
    {
        var reservations = await _context.CouponRedemptions
            .Where(r => r.OrderId == orderId && r.Status == CouponRedemptionStatus.Reserved)
            .ToListAsync(cancellationToken);

        foreach (var r in reservations)
            r.Status = CouponRedemptionStatus.Released;
    }

    private async Task<HashSet<int>> GetApplicableCourseIdsAsync(
        Coupon coupon,
        IList<CoursePaymentInfo> courses,
        CancellationToken cancellationToken)
    {
        var courseIds = courses.Select(c => int.Parse(c.Id)).ToHashSet();

        return coupon.ScopeType switch
        {
            CouponScopeType.Platform => courseIds,

            CouponScopeType.SpecificCourse => courseIds.Contains(coupon.CourseId)
                ? new HashSet<int> { coupon.CourseId }
                : new HashSet<int>(),

            CouponScopeType.InstructorCourses => (await _context.Courses
                .Where(c => courseIds.Contains(c.Id) && c.CreatedBy == coupon.OwnerUserId)
                .Select(c => c.Id)
                .ToListAsync(cancellationToken))
                .ToHashSet(),

            _ => new HashSet<int>()
        };
    }

    private static (float discountedPrice, float discountAmount) ApplyDiscount(Coupon coupon, float originalPrice)
    {
        return coupon.Type switch
        {
            CouponType.Free => (0f, originalPrice),

            CouponType.CustomPrice => coupon.DiscountValue >= (decimal)originalPrice
                ? (0f, originalPrice)
                : ((float)coupon.DiscountValue, originalPrice - (float)coupon.DiscountValue),

            CouponType.Percentage => originalPrice * (float)(coupon.DiscountValue / 100m) is var discount
                ? (originalPrice - discount, discount)
                : (originalPrice, 0f),

            CouponType.FixedAmount => coupon.DiscountValue >= (decimal)originalPrice
                ? (0f, originalPrice)
                : (originalPrice - (float)coupon.DiscountValue, (float)coupon.DiscountValue),

            _ => (originalPrice, 0f)
        };
    }

    private static CouponApplicationResult Invalid(string message) => new()
    {
        IsValid = false,
        ErrorMessage = message
    };
}
