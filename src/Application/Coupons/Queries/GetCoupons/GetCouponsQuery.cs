using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Common.Security;
using Edunary.Domain.Constants;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Coupons.Queries.GetCoupons;

[Authorize]
public class GetCouponsQuery : IRequest<PaginatedList<CouponDto>>
{
    public int CourseId { get; init; }
    public bool ActiveOnly { get; init; }
    public string OwnerUserId { get; init; }
    public string Code { get; init; }
    public int? TypeFilter { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string SortField { get; init; } = "created";
    public string SortDir { get; init; } = "desc";
}

public class GetCouponsQueryHandler : IRequestHandler<GetCouponsQuery, PaginatedList<CouponDto>>
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

    public async Task<PaginatedList<CouponDto>> Handle(GetCouponsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        var isAdmin = await _identityService.IsInRoleAsync(userId, Roles.Administrator)
            || await _identityService.IsInRoleAsync(userId, Roles.SuperAdmin);
        var pageNumber = request.PageNumber < 1 ? 1 : request.PageNumber;
        var pageSize = request.PageSize < 1 ? 10 : request.PageSize;
        var sortField = request.SortField?.Trim().ToLowerInvariant() ?? "created";
        var sortDir = request.SortDir?.Trim().ToLowerInvariant() == "asc" ? "asc" : "desc";
        var now = DateTimeOffset.UtcNow;

        var query = _context.Coupons
            .AsNoTracking()
            .AsQueryable();

        if (!isAdmin)
        {
            query = query.Where(c => c.OwnerUserId == userId);
        }

        if (isAdmin && !string.IsNullOrWhiteSpace(request.OwnerUserId))
        {
            query = query.Where(c => c.OwnerUserId == request.OwnerUserId);
        }

        if (request.CourseId > 0)
        {
            query = query.Where(c => c.CourseId == request.CourseId);
        }

        if (request.ActiveOnly)
        {
            query = query.Where(c => c.IsActive && c.ExpiresAt > now);
        }

        if (!string.IsNullOrWhiteSpace(request.Code))
        {
            query = query.Where(c => c.Code.Contains(request.Code.ToUpper()));
        }

        if (request.TypeFilter.HasValue)
        {
            query = query.Where(c => (int)c.Type == request.TypeFilter.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        if (totalCount == 0)
        {
            return new PaginatedList<CouponDto>(Array.Empty<CouponDto>(), 0, pageNumber, pageSize);
        }

        if (sortField == "owner")
        {
            var coupons = await query
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

            await HydrateCouponOwnersAsync(coupons, cancellationToken);

            var orderedCoupons = sortDir == "asc"
                ? coupons.OrderBy(c => GetOwnerSortLabel(c), StringComparer.OrdinalIgnoreCase)
                    .ThenBy(c => c.Code, StringComparer.OrdinalIgnoreCase)
                : coupons.OrderByDescending(c => GetOwnerSortLabel(c), StringComparer.OrdinalIgnoreCase)
                    .ThenByDescending(c => c.Code, StringComparer.OrdinalIgnoreCase);

            var pageItems = orderedCoupons
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return new PaginatedList<CouponDto>(pageItems, totalCount, pageNumber, pageSize);
        }

        var orderedQuery = ApplySort(query, sortField, sortDir, now);
        var pagedCoupons = await orderedQuery
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
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
            await HydrateCouponOwnersAsync(pagedCoupons, cancellationToken);
        }

        return new PaginatedList<CouponDto>(pagedCoupons, totalCount, pageNumber, pageSize);
    }

    private static IQueryable<Coupon> ApplySort(
        IQueryable<Coupon> query,
        string sortField,
        string sortDir,
        DateTimeOffset now)
    {
        var asc = sortDir == "asc";

        return sortField switch
        {
            "code" => asc
                ? query.OrderBy(c => c.Code)
                : query.OrderByDescending(c => c.Code),
            "name" => asc
                ? query.OrderBy(c => c.Name)
                : query.OrderByDescending(c => c.Name),
            "type" => asc
                ? query.OrderBy(c => c.Type)
                : query.OrderByDescending(c => c.Type),
            "discount" => asc
                ? query.OrderBy(c => c.DiscountValue)
                : query.OrderByDescending(c => c.DiscountValue),
            "used" => asc
                ? query.OrderBy(c => c.RedemptionCount)
                : query.OrderByDescending(c => c.RedemptionCount),
            "expires" => asc
                ? query.OrderBy(c => c.ExpiresAt)
                : query.OrderByDescending(c => c.ExpiresAt),
            "status" => asc
                ? query.OrderBy(c => !c.IsActive
                    ? 0
                    : c.ExpiresAt < now
                        ? 1
                        : c.StartsAt > now
                            ? 2
                            : 3)
                : query.OrderByDescending(c => !c.IsActive
                    ? 0
                    : c.ExpiresAt < now
                        ? 1
                        : c.StartsAt > now
                            ? 2
                            : 3),
            _ => asc
                ? query.OrderBy(c => c.Created)
                : query.OrderByDescending(c => c.Created),
        };
    }

    private async Task HydrateCouponOwnersAsync(
        List<CouponDto> coupons,
        CancellationToken cancellationToken)
    {
        var ownerIds = coupons
            .Where(d => !string.IsNullOrWhiteSpace(d.OwnerUserId))
            .Select(d => d.OwnerUserId)
            .Distinct()
            .ToList();

        if (ownerIds.Count == 0)
        {
            return;
        }

        var owners = await _identityService.GetUserIdentitiesByIdsAsync(ownerIds, cancellationToken);
        var ownerMap = owners.ToDictionary(u => u.Id);

        foreach (var coupon in coupons)
        {
            if (string.IsNullOrWhiteSpace(coupon.OwnerUserId))
            {
                continue;
            }

            if (ownerMap.TryGetValue(coupon.OwnerUserId, out var owner))
            {
                coupon.OwnerFullName = owner.FullName ?? string.Empty;
                coupon.OwnerEmail = owner.Email ?? string.Empty;
            }
        }
    }

    private static string GetOwnerSortLabel(CouponDto coupon)
    {
        if (!string.IsNullOrWhiteSpace(coupon.OwnerFullName))
        {
            return coupon.OwnerFullName;
        }

        if (!string.IsNullOrWhiteSpace(coupon.OwnerEmail))
        {
            return coupon.OwnerEmail;
        }

        return coupon.OwnerUserId ?? string.Empty;
    }
}
