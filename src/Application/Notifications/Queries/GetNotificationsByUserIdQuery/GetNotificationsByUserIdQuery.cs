
using AutoMapper;
using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.Notifications.Queries.GetNotificationsByUserIdQuery;
public class GetNotificationsByUserIdQuery : IRequest<NotificationsVm>
{

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

        var unreadCount = await _context.NotificationUsers
            .Where(nu => nu.StudentId == userId && !nu.IsRead)
            .CountAsync(cancellationToken);
        var Lists = await _context.NotificationUsers
            .Where(nu => nu.StudentId == userId)
            .OrderByDescending(nu => nu.Notification.Created)
            .ProjectTo<GetNotificationByUserIdDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
        return new NotificationsVm
        {
            Total = new List<TotalUnreadDto>
            {
                new TotalUnreadDto { Count = unreadCount }
            },

            Lists = Lists
        };
    }
}

