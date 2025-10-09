namespace Edunary.Application.Notifications.Queries.GetNotificationsByUserIdQuery;
public class NotificationsVm
{
    public IReadOnlyCollection<TotalUnreadDto> Total { get; init; } = Array.Empty<TotalUnreadDto>();

    public IReadOnlyCollection<GetNotificationByUserIdDto> Lists { get; init; } = Array.Empty<GetNotificationByUserIdDto>();
}
