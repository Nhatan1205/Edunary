using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Common.Security;
using Edunary.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Coupons.Commands.DeactivateCoupon;

[Authorize]
public class DeactivateCouponCommand : IRequest<Result>
{
    public int Id { get; init; }
}

public class DeactivateCouponCommandHandler : IRequestHandler<DeactivateCouponCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;

    public DeactivateCouponCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IIdentityService identityService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _identityService = identityService;
    }

    public async Task<Result> Handle(DeactivateCouponCommand request, CancellationToken cancellationToken)
    {
        var coupon = await _context.Coupons
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (coupon == null)
            return Result.Failure("Coupon not found");

        var userId = _currentUserService.UserId;
        var isAdmin = await _identityService.IsInRoleAsync(userId, Roles.Administrator);

        if (!isAdmin && coupon.OwnerUserId != userId)
            return Result.Failure("You are not authorized to deactivate this coupon");

        coupon.IsActive = false;
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(null, "Coupon deactivated");
    }
}
