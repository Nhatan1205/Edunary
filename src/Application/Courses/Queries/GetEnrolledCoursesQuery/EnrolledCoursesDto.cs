using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.Courses.Queries.GetEnrolledCoursesQuery;
public class EnrolledCoursesDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Subtitle { get; set; }
    public float Price { get; set; }
    public int CategoryId { get; set; }
    public string ImageUrl { get; set; }
    public CourseStatus Status { get; set; }
    public DateTimeOffset Created { get; set; }
    public string CreatedBy { get; set; }
    public string InstructorName { get; set; }
    public float Ratings { get; set; }

    public int TotalLectures { get; set; }
    public int CompletedLectures { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Course, EnrolledCoursesDto>();
        }
    }
}
