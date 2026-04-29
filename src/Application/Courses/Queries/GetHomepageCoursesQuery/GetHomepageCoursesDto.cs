using Edunary.Domain.Entities;
using Edunary.Application.Courses.Queries.GetCourseById;

namespace Edunary.Application.Courses.Queries.GetHomepageCoursesQuery;
public class GetHomepageCoursesDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Subtitle { get; set; }
    public float Price { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; }
    public string ImageUrl { get; set; }
    public string Level { get; set; }
    public string Description { get; set; }
    public string LearningObjectives { get; set; }
    public List<CourseTopicItemDto> Topics { get; set; } = new();
    public float Ratings { get; set; }
    public int TotalStudents { get; set; }
    public string CreatedBy { get; set; }
    public string InstructorName { get; set; }
    public bool IsEnrolled { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Course, GetHomepageCoursesDto>()
                    .ForMember(
                        dest => dest.Level,
                        opt => opt.MapFrom(src => src.Level.ToString())
                    )
                    .ForMember(
                        dest => dest.CategoryName,
                        opt => opt.MapFrom(src => src.Category.Title))
                    .ForMember(d => d.InstructorName, opt => opt.Ignore());

        }
    }
}
