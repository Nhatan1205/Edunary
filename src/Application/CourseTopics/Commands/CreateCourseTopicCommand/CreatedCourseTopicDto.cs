using Edunary.Domain.Entities;

namespace Edunary.Application.CourseTopics.Commands.CreateCourseTopic;

public class CreatedCourseTopicDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<CourseTopic, CreatedCourseTopicDto>();
        }
    }
}
