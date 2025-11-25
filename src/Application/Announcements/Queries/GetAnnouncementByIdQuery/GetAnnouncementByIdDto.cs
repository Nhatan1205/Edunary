using Edunary.Application.Announcements.Queries.GetAnnouncementsQuery;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.Announcements.Queries.GetAnnouncementByIdQuery;
public class GetAnnouncementByIdDto
{
    public string Subject { get; set; }
    public string Content { get; set; }
    public AnnouncementStatus Status { get; set; }
    public DateTime? SentAt { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Announcement, GetAnnouncementByIdDto>();

        }
    }
}
