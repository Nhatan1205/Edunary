using Edunary.Application.Courses.Queries.GetCoursesWithPagination;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.Announcements.Queries.GetAnnouncementsQuery;
public class GetAnnouncementDto
{
    public int Id { get; set; }
    public string Subject { get; set; }
    public string Content { get; set; }
    public AnnouncementStatus Status { get; set; }
    public DateTimeOffset? SentAt { get; set; }
    public DateTimeOffset Created { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Announcement, GetAnnouncementDto>();

        }
    }
}
