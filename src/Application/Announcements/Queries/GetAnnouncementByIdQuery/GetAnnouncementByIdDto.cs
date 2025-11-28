using Edunary.Application.Announcements.Queries.GetAnnouncementsQuery;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.Announcements.Queries.GetAnnouncementByIdQuery;
public class GetAnnouncementByIdDto
{
    public int Id { get; set; }
    public string Subject { get; set; }
    public string Content { get; set; }
    public AnnouncementStatus Status { get; set; }
    public DateTimeOffset? SentAt { get; set; }

    public List<int> CourseIds { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Announcement, GetAnnouncementByIdDto>()
            .ForMember(dest => dest.CourseIds, opt => opt.MapFrom(src => src.Courses.Select(c => c.Id).ToList()));

        }
    }
}
