using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.Courses.Queries.GetPublicCourseById;

public class InstructorDto
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Avatar { get; set; } = null!;
}
public class GetPublicCourseByIdDto
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
    public string CreatedBy { get; set; }
    public int CategoryId { get; set; }
    public string CategoryTitle { get; set; } = null!;
    public float Ratings { get; set; }
    public int TotalStudents { get; set; }
    public string Content { get; set; } = null!;
    public DateTimeOffset LastModified { get; set; }
    public InstructorDto Instructor { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Course, GetPublicCourseByIdDto>()
                .ForMember(dest => dest.CategoryTitle, opt => opt.MapFrom(src => src.Category.Title))
                .ForMember(dest => dest.Instructor, opt => opt.Ignore());
        }
    }
}
