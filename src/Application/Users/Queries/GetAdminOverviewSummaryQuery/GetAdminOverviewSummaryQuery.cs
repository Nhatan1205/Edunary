using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.Users.Queries.GetAdminOverviewSummaryQuery;

public record GetAdminOverviewSummaryQuery : IRequest<AdminOverviewSummaryDto>;

public class GetAdminOverviewSummaryQueryHandler
    : IRequestHandler<GetAdminOverviewSummaryQuery, AdminOverviewSummaryDto>
{
    private readonly IIdentityService _identityService;
    private readonly IApplicationDbContext _context;
    private readonly IConnectionManagerService _connectionManager;

    public GetAdminOverviewSummaryQueryHandler(
        IIdentityService identityService,
        IApplicationDbContext context,
        IConnectionManagerService connectionManager)
    {
        _identityService = identityService;
        _context = context;
        _connectionManager = connectionManager;
    }

    public async Task<AdminOverviewSummaryDto> Handle(
        GetAdminOverviewSummaryQuery request, CancellationToken cancellationToken)
    {
        // ── 1. Get overview stats
        var stats = await _identityService.GetOverviewStatsAsync(cancellationToken);

        //2. Get online user in connection manager
        var onlineNow = _connectionManager.GetOnlineCount();

        //3. Get top 5 active users by enrollment count
        var topStudents = await _context.Enrollments
            .GroupBy(e => e.StudentId)
            .Select(g => new { StudentId = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(5)
            .ToListAsync(cancellationToken);

        var studentIds = topStudents.Select(x => x.StudentId).ToList();
        var userDict = (await _identityService.GetUserIdentitiesByIdsAsync(studentIds, cancellationToken))
            .ToDictionary(u => u.Id);

        var topUsers = new List<TopActiveUserDto>();
        foreach (var item in topStudents)
        {
            if (!userDict.TryGetValue(item.StudentId, out var user)) continue;

            topUsers.Add(new TopActiveUserDto
            {
                Id           = user.Id,
                FullName     = user.FullName,
                Avatar       = user.Avatar,
                EnrolledCount = item.Count,
                LastLogin    = FormatRelativeTime(user.LastLoginTime),
            });
        }

        //
        return new AdminOverviewSummaryDto
        {
            ActiveUsers      = stats.ActiveUsers,
            ActiveUsersTrend = stats.ActiveUsersTrend,
            NewUsers30d      = stats.NewUsers30d,
            NewUsersTrend    = stats.NewUsersTrend,
            OnlineNow        = onlineNow,

            StatusActive    = stats.StatusActive,
            StatusInactive  = stats.StatusInactive,
            StatusSuspended = stats.StatusSuspended,
            StatusBanned    = stats.StatusBanned,

            TopActiveUsers = topUsers,
        };
    }

    private static string FormatRelativeTime(DateTime? time)
    {
        if (time == null) return "Never";
        var diff = DateTime.UtcNow - time.Value.ToUniversalTime();
        if (diff.TotalMinutes < 1)  return "Just now";
        if (diff.TotalHours < 1)    return $"{(int)diff.TotalMinutes}m ago";
        if (diff.TotalDays < 1)     return $"{(int)diff.TotalHours}h ago";
        if (diff.TotalDays < 30)    return $"{(int)diff.TotalDays}d ago";
        return time.Value.ToString("MMM yyyy");
    }
}
