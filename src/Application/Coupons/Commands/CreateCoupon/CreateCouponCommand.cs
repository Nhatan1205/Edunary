using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Common.Security;
using Edunary.Domain.Constants;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Coupons.Commands.CreateCoupon;

[Authorize]
public class CreateCouponCommand : IRequest<Result>
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;

    public CouponType Type { get; init; }
    public decimal DiscountValue { get; init; }

    public CouponScopeType ScopeType { get; init; }
    public int CourseId { get; init; }

    public CouponFunderType FunderType { get; init; }

    public int MaxRedemptions { get; init; }
    public int MaxRedemptionsPerUser { get; init; } = 1;

    public DateTimeOffset StartsAt { get; init; }
    public DateTimeOffset ExpiresAt { get; init; }
}

public class CreateCouponCommandHandler : IRequestHandler<CreateCouponCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;

    public CreateCouponCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IIdentityService identityService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _identityService = identityService;
    }

    public async Task<Result> Handle(CreateCouponCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        var isAdmin = await _identityService.IsInRoleAsync(userId, Roles.Administrator);

        // Platform-scope requires Administrator
        if (request.ScopeType == CouponScopeType.Platform && !isAdmin)
            return Result.Failure("Only administrators can create platform-wide coupons");

        // Platform-funded coupons require Administrator (instructors cannot shift discount cost to the platform)
        if (request.FunderType == CouponFunderType.Platform && !isAdmin)
            return Result.Failure("Only administrators can create platform-funded coupons");

        // Instructor creating a course-specific coupon must own that course
        if (request.ScopeType == CouponScopeType.SpecificCourse && !isAdmin)
        {
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == request.CourseId, cancellationToken);

            if (course == null)
                return Result.Failure("Course not found");

            if (course.CreatedBy != userId)
                return Result.Failure("You can only create coupons for your own courses");

            // Max 3 active coupons per course per month
            var now = DateTimeOffset.UtcNow;
            var monthStart = new DateTimeOffset(now.Year, now.Month, 1, 0, 0, 0, TimeSpan.Zero);
            var activeThisMonth = await _context.Coupons
                .CountAsync(c => c.CourseId == request.CourseId
                    && c.IsActive
                    && c.Created >= monthStart, cancellationToken);

            if (activeThisMonth >= 3)
                return Result.Failure("You can have at most 3 active coupons per course per month");
        }

        // Code must be unique
        var codeExists = await _context.Coupons
            .AnyAsync(c => c.Code == request.Code.ToUpperInvariant(), cancellationToken);
        if (codeExists)
            return Result.Failure($"Coupon code '{request.Code}' is already in use");

        // FixedAmount/CustomPrice require value > 0; Percentage requires 0 < value <= 100
        if (request.Type == CouponType.Percentage && (request.DiscountValue <= 0 || request.DiscountValue > 100))
            return Result.Failure("Percentage discount must be between 1 and 100");

        if ((request.Type == CouponType.FixedAmount || request.Type == CouponType.CustomPrice)
            && request.DiscountValue <= 0)
            return Result.Failure("Discount value must be greater than 0");

        if (request.StartsAt >= request.ExpiresAt)
            return Result.Failure("Start date must be before expiry date");

        if (request.ExpiresAt <= DateTimeOffset.UtcNow)
            return Result.Failure("Expiry date must be in the future");

        var coupon = new Coupon
        {
            Code = request.Code.ToUpperInvariant(),
            Name = request.Name,
            Description = request.Description,
            Type = request.Type,
            DiscountValue = request.DiscountValue,
            ScopeType = request.ScopeType,
            CourseId = request.CourseId,
            OwnerUserId = userId,
            FunderType = request.FunderType,
            MaxRedemptions = request.MaxRedemptions,
            MaxRedemptionsPerUser = request.MaxRedemptionsPerUser,
            StartsAt = request.StartsAt,
            ExpiresAt = request.ExpiresAt,
            IsActive = true
        };

        _context.Coupons.Add(coupon);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(new { coupon.Id, coupon.Code }, "Coupon created successfully");
    }
}
