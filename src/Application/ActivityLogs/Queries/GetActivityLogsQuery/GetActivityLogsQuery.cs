using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.ActivityLogs.Queries.GetActivityLogsQuery;

public record GetActivityLogsQuery : IRequest<PaginatedList<ActivityLogDto>>
{
    public string UserId { get; init; }
    public int ActivityTypeFilter { get; init; } = -1;
    public string Search { get; init; }
    public DateTimeOffset From { get; init; }
    public DateTimeOffset To { get; init; }
    public string SortOrder { get; init; } = "newest"; // "newest" | "oldest"
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}

public class GetActivityLogsQueryHandler : IRequestHandler<GetActivityLogsQuery, PaginatedList<ActivityLogDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public GetActivityLogsQueryHandler(IApplicationDbContext context, IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<PaginatedList<ActivityLogDto>> Handle(GetActivityLogsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.ActivityLogs.AsQueryable();

        // Filter by specific user
        if (!string.IsNullOrWhiteSpace(request.UserId))
            query = query.Where(l => l.UserId == request.UserId);

        // Filter by activity type (-1 = "all types")
        if (request.ActivityTypeFilter >= 0)
            query = query.Where(l => (int)l.ActivityType == request.ActivityTypeFilter);

        // Search in description
        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(l => l.Description.Contains(request.Search));

        // Filter by date range
        if (request.From != default)
            query = query.Where(l => l.Created >= request.From);

        if (request.To != default)
            query = query.Where(l => l.Created <= request.To);

        query = request.SortOrder == "oldest"
            ? query.OrderBy(l => l.Created)
            : query.OrderByDescending(l => l.Created);

        //get raw logs with manual pagination
        var totalCount = await query.CountAsync(cancellationToken);

        var logs = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(l => new ActivityLogDto
            {
                Id = l.Id,
                UserId = l.UserId,
                ActivityType = l.ActivityType,
                Description = l.Description,
                Created = l.Created
            })
            .ToListAsync(cancellationToken);

        // get user info from identity service
        var userIds = logs
            .Where(l => !string.IsNullOrEmpty(l.UserId))
            .Select(l => l.UserId)
            .Distinct()
            .ToList();

        if (userIds.Any())
        {
            var users = await _identityService.GetUserIdentitiesByIdsAsync(userIds, cancellationToken);
            var userMap = users.ToDictionary(u => u.Id);

            foreach (var log in logs)
            {
                if (!string.IsNullOrEmpty(log.UserId) && userMap.TryGetValue(log.UserId, out var user))
                {
                    log.FullName = user.FullName;
                    log.Email = user.Email;
                    log.Avatar = user.Avatar;
                }
            }
        }

        return new PaginatedList<ActivityLogDto>(logs, totalCount, request.PageNumber, request.PageSize);
    }
}
