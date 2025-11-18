using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.Courses.Queries.GetCoursesWithPagination;
public class GetCourseDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Subtitle { get; set; }
    public float Price { get; set; }
    public int CategoryId { get; set; }
    public string ImageUrl { get; set; }
    public CourseLevel Level { get; set; }
    public string LearningObjectives { get; set; }
    public string Topic { get; set; }
    public float Ratings { get; set; }
    public int TotalStudents { get; set; }
    public string InstructorName { get; set; }
    public string CreatedBy { get; set; }
    public string Created { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Course, GetCourseDto>()
                .ForMember(d => d.InstructorName, opt => opt.Ignore());

        }
    }
}
