using Edunary.Application.Courses.Queries.GetCoursesAuthorWithPagination;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.Courses.Queries.GetCourseById;
public class GetCourseByIdDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string Subtitle { get; set; } = null!;
    public string Description { get; set; } = null!;
    public CourseLevel Level { get; set; }
    public CourseStatus Status { get; set; }
    public string Topic { get; set; } = null!;
    public string LearningObjectives { get; set; } = null!;
    public string Requirements { get; set; } = null!;
    public string TargetAudience { get; set; } = null!;
    public string ImageUrl { get; set; } = null!;
    public string WelcomeMessage { get; set; } = null!;
    public string CongratulationsMessage { get; set; } = null!;
    public float Price { get; set; }
    public int CategoryId { get; set; }
    public string Content { get; set; } = null!;
    public int TotalStudents { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Course, GetCourseByIdDto>();
        }
    }
}
