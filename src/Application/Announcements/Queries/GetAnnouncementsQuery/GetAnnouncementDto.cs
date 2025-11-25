using Edunary.Application.Courses.Queries.GetCoursesWithPagination;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.Announcements.Queries.GetAnnouncementsQuery;
public class GetAnnouncementDto
{
    public string Subject { get; set; }
    public string Content { get; set; }
    public AnnouncementStatus Status { get; set; }
    public DateTime? SentAt { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Announcement, GetAnnouncementDto>();

        }
    }
}
