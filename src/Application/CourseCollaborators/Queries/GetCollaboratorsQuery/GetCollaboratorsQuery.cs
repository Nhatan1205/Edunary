using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;
namespace Edunary.Application.CourseCollaborators.Queries.GetCollaboratorsQuery;

public record GetCollaboratorsQuery : IRequest<List<CollaboratorDto>>
{
    public int CourseId { get; init; }
}

public class GetCollaboratorsQueryHandler : IRequestHandler<GetCollaboratorsQuery, List<CollaboratorDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;
    private readonly IIdentityService _identityService;

    public GetCollaboratorsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth,
        IIdentityService identityService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
        _identityService = identityService;
    }

    public async Task<List<CollaboratorDto>> Handle(GetCollaboratorsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId)) return new List<CollaboratorDto>();

        bool hasAccess = await _courseAuth.HasCourseAccessAsync(request.CourseId, userId, CoursePermission.None, cancellationToken);
        if (!hasAccess) return new List<CollaboratorDto>();

        var course = await _context.Courses
            .AsNoTracking()
            .Select(c => new { c.Id, c.CreatedBy })
            .FirstOrDefaultAsync(c => c.Id == request.CourseId, cancellationToken);

        Guard.Against.NotFound(request.CourseId, course);

        var collabs = await _context.CourseCollaborators
            .AsNoTracking()
            .Where(c => c.CourseId == request.CourseId)
            .ToListAsync(cancellationToken);

        var allUserIds = collabs.Select(c => c.UserId).Append(course.CreatedBy).Distinct().ToList();
        var userInfos = await _identityService.GetUserIdentitiesByIdsAsync(allUserIds, cancellationToken);
        var userMap = userInfos.ToDictionary(u => u.Id);

        // Owner as first entry
        var result = new List<CollaboratorDto>();
        if (userMap.TryGetValue(course.CreatedBy, out var ownerInfo))
        {
            result.Add(new CollaboratorDto
            {
                UserId = course.CreatedBy,
                FullName = ownerInfo.FullName,
                Email = ownerInfo.Email,
                AvatarUrl = ownerInfo.Avatar ?? string.Empty,
                Permissions = (CoursePermission)~0, // all flags
                IsVisible = true,
                IsOwner = true,
                InviteStatus = CollaboratorInviteStatus.Accepted,
            });
        }

        foreach (var collab in collabs)
        {
            userMap.TryGetValue(collab.UserId, out var info);
            result.Add(new CollaboratorDto
            {
                Id = collab.Id,
                UserId = collab.UserId,
                FullName = info?.FullName ?? string.Empty,
                Email = info?.Email ?? string.Empty,
                AvatarUrl = info?.Avatar ?? string.Empty,
                Permissions = collab.Permissions,
                IsVisible = collab.IsVisible,
                RevenueSharePercent = collab.RevenueSharePercent,
                InviteStatus = collab.InviteStatus,
                IsOwner = false,
            });
        }

        return result;
    }
}
