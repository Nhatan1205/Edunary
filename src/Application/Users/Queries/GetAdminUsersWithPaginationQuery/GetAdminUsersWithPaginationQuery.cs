using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Users;

namespace Edunary.Application.Users.Queries.GetAdminUsersWithPaginationQuery;

public record GetAdminUsersWithPaginationQuery : IRequest<PaginatedList<AdminUserListItemDto>>
{
    public string SearchText { get; init; }
    public string RoleFilter { get; init; }
    public string StatusFilter { get; init; }
    public string SortBy { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class GetAdminUsersWithPaginationQueryHandler
    : IRequestHandler<GetAdminUsersWithPaginationQuery, PaginatedList<AdminUserListItemDto>>
{
    private readonly IIdentityService _identityService;
    private readonly IApplicationDbContext _context;
    private readonly IConnectionManagerService _connectionManager;

    public GetAdminUsersWithPaginationQueryHandler(
        IIdentityService identityService,
        IApplicationDbContext context,
        IConnectionManagerService connectionManager)
    {
        _identityService = identityService;
        _context = context;
        _connectionManager = connectionManager;
    }

    public async Task<PaginatedList<AdminUserListItemDto>> Handle(
        GetAdminUsersWithPaginationQuery request, CancellationToken cancellationToken)
    {
        // 1. Get users
        var (users, totalCount) = await _identityService.GetFilteredUsersAsync(
            request.SearchText,
            request.RoleFilter,
            request.StatusFilter,
            request.SortBy,
            request.PageNumber,
            request.PageSize);

        if (!users.Any())
            return new PaginatedList<AdminUserListItemDto>(
                new List<AdminUserListItemDto>(), totalCount, request.PageNumber, request.PageSize);

        //2. Get user Ids
        var userIds = users.Select(u => u.Id).ToList();

        //3. Query number of enrollments of each user
        var enrollmentCountsTask = await _context.Enrollments
            .Where(e => userIds.Contains(e.StudentId))
            .GroupBy(e => e.StudentId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count, cancellationToken);

        //4. Query number of courses owned by each user
        var courseCountsTask = await _context.Courses
            .Where(c => userIds.Contains(c.CreatedBy))
            .GroupBy(c => c.CreatedBy)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count, cancellationToken);

        //5. Get online status — N parallel checks, pipelined by Redis client (~1 RTT)
        bool[] onlineResults = await Task.WhenAll(
            users.Select(u => _connectionManager.IsConnectedAsync(u.Id)));

        var onlineMap = users
            .Zip(onlineResults, (u, isOnline) => (u.Id, isOnline))
            .ToDictionary(x => x.Id, x => x.isOnline);

        //6. Map to Dto
        var items = users.Select(u => new AdminUserListItemDto
        {
            Id = u.Id,
            FullName = u.FullName,
            Email = u.Email,
            Avatar = u.Avatar,
            Roles = u.Roles,
            Status = u.Status.ToString(),
            LastLoginTime = u.LastLoginTime,
            CreatedAt = u.CreatedAt,

            EnrolledCourseCount = enrollmentCountsTask.GetValueOrDefault(u.Id, 0),
            CreatedCourseCount = courseCountsTask.GetValueOrDefault(u.Id, 0),

            IsOnline = onlineMap.GetValueOrDefault(u.Id, false),
        }).ToList();

        return new PaginatedList<AdminUserListItemDto>(items, totalCount, request.PageNumber, request.PageSize);
    }
}
