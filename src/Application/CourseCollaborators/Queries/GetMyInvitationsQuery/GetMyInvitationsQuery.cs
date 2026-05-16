using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseCollaborators.Queries.GetMyInvitationsQuery;

public record GetMyInvitationsQuery : IRequest<List<InvitationDto>>;

public class GetMyInvitationsQueryHandler : IRequestHandler<GetMyInvitationsQuery, List<InvitationDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;

    public GetMyInvitationsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IIdentityService identityService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _identityService = identityService;
    }

    public async Task<List<InvitationDto>> Handle(GetMyInvitationsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        var pending = await _context.CourseCollaborators
            .AsNoTracking()
            .Include(c => c.Course)
            .Where(c => c.UserId == userId && c.InviteStatus == CollaboratorInviteStatus.Pending)
            .OrderByDescending(c => c.Created)
            .ToListAsync(cancellationToken);

        if (pending.Count == 0) return [];

        var ownerIds = pending.Select(c => c.Course.CreatedBy).Distinct().ToList();
        var owners = await _identityService.GetUserIdentitiesByIdsAsync(ownerIds, cancellationToken);
        var ownerMap = owners.ToDictionary(o => o.Id);

        return pending.Select(c =>
        {
            ownerMap.TryGetValue(c.Course.CreatedBy, out var owner);
            return new InvitationDto
            {
                CollaboratorId = c.Id,
                CourseId = c.CourseId,
                CourseTitle = c.Course.Title,
                CourseImageUrl = c.Course.ImageUrl ?? string.Empty,
                OwnerName = owner?.FullName ?? string.Empty,
                OwnerAvatarUrl = owner?.Avatar ?? string.Empty,
                Permissions = c.Permissions,
                IsVisible = c.IsVisible,
                RevenueSharePercent = c.RevenueSharePercent,
                InvitedAt = c.Created,
            };
        }).ToList();
    }
}
