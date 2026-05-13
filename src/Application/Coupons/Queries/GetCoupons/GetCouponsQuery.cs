using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Common.Security;
using Edunary.Domain.Constants;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Coupons.Queries.GetCoupons;

[Authorize]
public class GetCouponsQuery : IRequest<List<CouponDto>>
{
    public int CourseId { get; init; }
    public bool ActiveOnly { get; init; }
    public string OwnerUserId { get; init; }
    public string Code { get; init; }
    public int? TypeFilter { get; init; }
}

public class GetCouponsQueryHandler : IRequestHandler<GetCouponsQuery, List<CouponDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;

    public GetCouponsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IIdentityService identityService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _identityService = identityService;
    }

    public async Task<List<CouponDto>> Handle(GetCouponsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        var isAdmin = await _identityService.IsInRoleAsync(userId, Roles.Administrator);

        var query = _context.Coupons.AsQueryable();

        if (!isAdmin)
            query = query.Where(c => c.OwnerUserId == userId);

        if (isAdmin && !string.IsNullOrEmpty(request.OwnerUserId))
            query = query.Where(c => c.OwnerUserId == request.OwnerUserId);

        if (request.CourseId > 0)
            query = query.Where(c => c.CourseId == request.CourseId);

        if (request.ActiveOnly)
            query = query.Where(c => c.IsActive && c.ExpiresAt > DateTimeOffset.UtcNow);

        if (!string.IsNullOrEmpty(request.Code))
            query = query.Where(c => c.Code.Contains(request.Code.ToUpper()));

        if (request.TypeFilter.HasValue)
            query = query.Where(c => (int)c.Type == request.TypeFilter.Value);

        var dtos = await query
            .OrderByDescending(c => c.Created)
            .Select(c => new CouponDto
            {
                Id = c.Id,
                Code = c.Code,
                Name = c.Name,
                Description = c.Description,
                Type = c.Type,
                DiscountValue = c.DiscountValue,
                ScopeType = c.ScopeType,
                CourseId = c.CourseId,
                OwnerUserId = string.IsNullOrEmpty(c.OwnerUserId) ? c.CreatedBy : c.OwnerUserId,
                FunderType = c.FunderType,
                MaxRedemptions = c.MaxRedemptions,
                RedemptionCount = c.RedemptionCount,
                MaxRedemptionsPerUser = c.MaxRedemptionsPerUser,
                StartsAt = c.StartsAt,
                ExpiresAt = c.ExpiresAt,
                IsActive = c.IsActive,
                Created = c.Created
            })
            .ToListAsync(cancellationToken);

        if (isAdmin)
        {
            var ownerIds = dtos
                .Where(d => !string.IsNullOrEmpty(d.OwnerUserId))
                .Select(d => d.OwnerUserId)
                .Distinct()
                .ToList();

            if (ownerIds.Count > 0)
            {
                var owners = await _identityService.GetUserIdentitiesByIdsAsync(ownerIds, cancellationToken);
                var ownerMap = owners.ToDictionary(u => u.Id);
                foreach (var dto in dtos)
                {
                    if (ownerMap.TryGetValue(dto.OwnerUserId, out var owner))
                    {
                        dto.OwnerFullName = owner.FullName;
                        dto.OwnerEmail = owner.Email;
                    }
                }
            }
        }

        return dtos;
    }
}
