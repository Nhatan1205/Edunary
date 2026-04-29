using Edunary.Domain.Entities;
using Edunary.Application.Courses.Queries.GetCourseById;

namespace Edunary.Application.Courses.Queries.GetPublicCoursesByUserIdQuery;
public class PublicCoursesByUserIdDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Subtitle { get; set; }
    public float Price { get; set; }
    public string ImageUrl { get; set; }
    public string Level { get; set; }
    public List<TopicItemDto> Topics { get; set; } = new();
    public float Ratings { get; set; }
    public int TotalStudents { get; set; }
    public string CreatedBy { get; set; }
    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Course, PublicCoursesByUserIdDto>()
                    .ForMember(
                        dest => dest.Level,
                        opt => opt.MapFrom(src => src.Level.ToString())
                    );
        }
    }
}
