using AutoMapper;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Notifications.Queries.GetNotificationsByUserIdQuery;
public class GetNotificationsByUserIdQuery : IRequest<NotificationsVm>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string Status { get; init; } = "all";
}

public class GetNotificationsByUserIdQueryHandler : IRequestHandler<GetNotificationsByUserIdQuery, NotificationsVm>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public GetNotificationsByUserIdQueryHandler(IApplicationDbContext context, IMapper mapper, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<NotificationsVm> Handle(GetNotificationsByUserIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;
        var status = request.Status?.Trim().ToLowerInvariant() ?? "all";

        if (string.IsNullOrEmpty(userId))
        {
            return new NotificationsVm
            {
                UnreadCount = 0,
                List = new PaginatedList<GetNotificationByUserIdDto>(
                    Array.Empty<GetNotificationByUserIdDto>(),
                    0,
                    request.PageNumber,
                    request.PageSize)
            };
        }

        var unreadCount = await _context.NotificationUsers
            .Where(nu => nu.StudentId == userId && !nu.IsRead)
            .CountAsync(cancellationToken);

        var query = _context.NotificationUsers
            .Where(nu => nu.StudentId == userId);

        if (status == "unread")
        {
            query = query.Where(nu => !nu.IsRead);
        }
        else if (status == "read")
        {
            query = query.Where(nu => nu.IsRead);
        }

        var list = await query
            .OrderByDescending(nu => nu.Notification.Created)
            .ProjectTo<GetNotificationByUserIdDto>(_mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);

        return new NotificationsVm
        {
            UnreadCount = unreadCount,
            List = list
        };
    }
}
