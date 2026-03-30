using Edunary.Domain.Entities;

namespace Edunary.Application.Roadmaps.Commands.CreateRoadmapCommand;
public class CreatedRoadmapDto
{
    public int Id { get; set; }

    public string Title { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Roadmap, CreatedRoadmapDto>();
        }
    }
}
