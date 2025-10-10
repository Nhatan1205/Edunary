namespace Edunary.Application.Notifications.Queries.GetNotificationsByUserIdQuery;
public class NotificationsVm
{
    public int UnreadCount { get; init; }

    public IReadOnlyCollection<GetNotificationByUserIdDto> List { get; init; } = Array.Empty<GetNotificationByUserIdDto>();
}
