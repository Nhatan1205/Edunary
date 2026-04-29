using Edunary.Domain.Entities;

namespace Edunary.Application.Topics.Queries.GetTopicsQuery;
public class GetTopicDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int CourseCount { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Topic, GetTopicDto>()
                .ForMember(d => d.CourseCount, opt => opt.MapFrom(src => src.Courses.Count));
        }
    }
}
