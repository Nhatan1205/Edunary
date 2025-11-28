using Edunary.Domain.Entities;

namespace Edunary.Application.Notifications.Queries.GetNotificationsByUserIdQuery;
public class GetNotificationByUserIdDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string Message { get; set; } = null!;
    public string Type { get; set; }
    public DateTimeOffset Created { get; set; }
    public bool IsRead { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            // map entity Notification → DTO
            CreateMap<Notification, GetNotificationByUserIdDto>();
            CreateMap<NotificationUser, GetNotificationByUserIdDto>()
                .IncludeMembers(src => src.Notification);
        }
    }

}
