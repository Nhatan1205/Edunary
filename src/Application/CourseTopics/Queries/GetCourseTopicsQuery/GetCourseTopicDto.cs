using Edunary.Domain.Entities;

namespace Edunary.Application.CourseTopics.Queries.GetCourseTopics;

public class GetCourseTopicDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int CourseCount { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<CourseTopic, GetCourseTopicDto>()
                .ForMember(d => d.CourseCount, opt => opt.MapFrom(src => src.Courses.Count));
        }
    }
}
