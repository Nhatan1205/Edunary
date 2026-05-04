using Edunary.Domain.Entities;

namespace Edunary.Application.Roadmaps.Queries.GetStudentRoadmapsQuery;

public class StudentRoadmapDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Subtitle { get; set; }
    public string Description { get; set; }
    public string Level { get; set; }
    public DateTimeOffset Created { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Roadmap, StudentRoadmapDto>()
                .ForMember(dest => dest.Level, opt => opt.MapFrom(src => src.Level.ToString()));
        }
    }
}
