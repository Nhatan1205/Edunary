using Edunary.Domain.Entities;

namespace Edunary.Application.CourseProgresses.Queries.GetCourseProgressQuery;

public class CourseProgressDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string StudentId { get; set; }
    public string Progress { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<CourseProgress, CourseProgressDto>();
        }
    }
}
