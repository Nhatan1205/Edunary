using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Edunary.Application.Courses.Queries.GetCourseById;
using AutoMapper;

namespace Edunary.Application.Courses.Queries.GetPublicCourseById;

public class InstructorDto
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public string Headline { get; set; }
    public string Description { get; set; }
}

public class GetPublicCourseByIdDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string Subtitle { get; set; } = null!;
    public string Description { get; set; } = null!;
    public CourseLevel Level { get; set; }
    public CourseStatus Status { get; set; }
    public List<TopicItemDto> Topics { get; set; } = new();
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
    public int TotalRatings { get; set; }
    public int TotalStudents { get; set; }
    public bool IsEnrolled { get; set; }
    public string Content { get; set; } = null!;
    public DateTimeOffset LastModified { get; set; }
    public List<InstructorDto> Instructors { get; set; } = new();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Topic, TopicItemDto>();
            CreateMap<Course, GetPublicCourseByIdDto>()
                .ForMember(dest => dest.CategoryTitle, opt => opt.MapFrom(src => src.Category.Title))
                .ForMember(dest => dest.Instructors, opt => opt.Ignore());
        }
    }
}
