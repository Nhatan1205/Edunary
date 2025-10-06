using Edunary.Domain.Entities;

namespace Edunary.Application.Courses.Queries.GetCoursesWithPagination;
public class GetCourseDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Subtitle { get; set; }
    public float Price { get; set; }
    public int CategoryId { get; set; }
    public string ImageUrl { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Course, GetCourseDto>();
        }
    }
}
