using Edunary.Domain.Entities;

namespace Edunary.Application.Announcements.Queries.GetAnnouncementsByCourseIdQuery;

public class GetAnnouncementByCourseIdDto
{
    public int Id { get; set; }
    public string Subject { get; set; }
    public string Content { get; set; }
    public DateTimeOffset? SentAt { get; set; }

    // Populated post-mapping
    public string InstructorId { get; set; }
    public string InstructorName { get; set; }
    public string InstructorAvatar { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Announcement, GetAnnouncementByCourseIdDto>()
                .ForMember(d => d.InstructorId, opt => opt.MapFrom(s => s.CreatedBy))
                .ForMember(d => d.InstructorName, opt => opt.Ignore())
                .ForMember(d => d.InstructorAvatar, opt => opt.Ignore());
        }
    }
}
