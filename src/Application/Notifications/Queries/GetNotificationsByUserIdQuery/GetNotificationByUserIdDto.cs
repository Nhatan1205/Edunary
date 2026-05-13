using Edunary.Domain.Entities;

namespace Edunary.Application.Notifications.Queries.GetNotificationsByUserIdQuery;
public class GetNotificationByUserIdDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;

    public string ImageUrl { get; set; } = null!;

    public string Message { get; set; } = null!;
    public string Type { get; set; }
    public string Subject { get; set; }
    public int CourseId { get; set; }
    public string Url { get; set; }
    public DateTimeOffset Created { get; set; }
    public bool IsRead { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Notification, GetNotificationByUserIdDto>();
            CreateMap<NotificationUser, GetNotificationByUserIdDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .IncludeMembers(src => src.Notification);
        }
    }
}
