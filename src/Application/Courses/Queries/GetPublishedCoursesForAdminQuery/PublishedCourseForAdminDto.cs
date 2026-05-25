using Edunary.Domain.Entities;

namespace Edunary.Application.Courses.Queries.GetPublishedCoursesForAdminQuery;
public class PublishedCourseForAdminDto
{
    public int CourseId { get; set; }
    public string Title { get; set; }
    public string Subtitle { get; set; }
    public string ImageUrl { get; set; }
    public string InstructorId { get; set; }
    public string InstructorName { get; set; }
    public string InstructorAvatar { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; }
    public float Price { get; set; }
    public int TotalStudents { get; set; }
    public float Ratings { get; set; }
    public DateTimeOffset LastModified { get; set; }
    public bool IsModifiedSinceApproval { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Course, PublishedCourseForAdminDto>()
                .ForMember(d => d.CourseId, opt => opt.MapFrom(s => s.Id))
                .ForMember(d => d.InstructorId, opt => opt.MapFrom(s => s.CreatedBy))
                .ForMember(d => d.InstructorName, opt => opt.Ignore())
                .ForMember(d => d.InstructorAvatar, opt => opt.Ignore())
                .ForMember(d => d.CategoryName, opt => opt.MapFrom(s => s.Category.Title))
                // Add 2-second buffer to ignore millisecond differences when course and snapshot are saved at the same time
                .ForMember(d => d.IsModifiedSinceApproval, opt => opt.MapFrom(s =>
                    s.ApprovedSnapshots.Any() && s.LastModified > s.ApprovedSnapshots.Max(x => x.Created).AddSeconds(2)));
        }
    }
}
