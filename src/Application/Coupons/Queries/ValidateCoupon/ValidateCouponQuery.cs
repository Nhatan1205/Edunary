using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Common.Security;
using Edunary.Application.Coupons.Models;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Coupons.Queries.ValidateCoupon;

[Authorize]
public class ValidateCouponQuery : IRequest<CouponApplicationResult>
{
    public string Code { get; init; } = string.Empty;
    public List<int> CourseIds { get; init; } = new();
}

public class ValidateCouponQueryHandler : IRequestHandler<ValidateCouponQuery, CouponApplicationResult>
{
    private readonly IApplicationDbContext _context;
    private readonly ICouponService _couponService;
    private readonly ICurrentUserService _currentUserService;

    public ValidateCouponQueryHandler(
        IApplicationDbContext context,
        ICouponService couponService,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _couponService = couponService;
        _currentUserService = currentUserService;
    }

    public async Task<CouponApplicationResult> Handle(ValidateCouponQuery request, CancellationToken cancellationToken)
    {
        var courses = await _context.Courses
            .Where(c => request.CourseIds.Contains(c.Id))
            .Select(c => new CoursePaymentInfo { Id = c.Id.ToString(), Name = c.Title, Price = (decimal)c.Price })
            .ToListAsync(cancellationToken);

        if (!courses.Any())
            return new CouponApplicationResult { IsValid = false, ErrorMessage = "No valid courses found" };

        return await _couponService.ValidateAndCalculateAsync(
            courses, _currentUserService.UserId, request.Code, cancellationToken);
    }
}
