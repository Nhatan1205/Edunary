using Edunary.Application.Common.Models;

namespace Edunary.Application.Notifications.Queries.GetNotificationsByUserIdQuery;
public class NotificationsVm
{
    public int UnreadCount { get; init; }

    public PaginatedList<GetNotificationByUserIdDto> List { get; init; }
}
