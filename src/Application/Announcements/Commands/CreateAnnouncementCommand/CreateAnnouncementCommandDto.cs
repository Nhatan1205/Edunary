using Edunary.Domain.Entities;

namespace Edunary.Application.Announcements.Commands.CreateDraftAnnouncementCommand;
public class CreateAnnouncementCommandDto
{
    public int Id { get; set; }
    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Announcement, CreateAnnouncementCommandDto>();
        }
    }
}
