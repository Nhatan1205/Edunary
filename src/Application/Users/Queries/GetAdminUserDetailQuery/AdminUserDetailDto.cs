using AutoMapper;
using Edunary.Domain.Entities;

namespace Edunary.Application.Users.Queries.GetAdminUserDetailQuery;

public class AdminUserDetailDto
{
    public string Id { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string Avatar { get; set; }
    public string Headline { get; set; }
    public string Description { get; set; }
    public string Links { get; set; }
    public List<string> Roles { get; set; } = new();
    public string Status { get; set; }
    public DateTime? LastLoginTime { get; set; }
    public DateTime? CreatedAt { get; set; }
    public bool IsOnline { get; set; }

    public AdminUserStatsDto Stats { get; set; } = new();
    public List<AdminEnrolledCourseDto> EnrolledCourses { get; set; } = new();
    public List<AdminCreatedCourseDto> CreatedCourses { get; set; } = new();
}

public class AdminUserStatsDto
{
    public int EnrolledCourseCount { get; set; }
    public int CreatedCourseCount { get; set; }
    public float TotalSpent { get; set; }
    public float TotalEarned { get; set; }
    public int TotalLearners { get; set; }
    public float AvgRating { get; set; }
}

public class AdminEnrolledCourseDto
{
    public int CourseId { get; set; }
    public string CourseTitle { get; set; }
    public string CourseImage { get; set; }
    public DateTime EnrolledDate { get; set; }
    public float ProgressPercentage { get; set; }
}

public class AdminCreatedCourseDto
{
    public int CourseId { get; set; }       
    public string CourseTitle { get; set; } 
    public string CourseImage { get; set; }
    public string Status { get; set; } 
    public int TotalStudents { get; set; }  
    public float Ratings { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Course, AdminCreatedCourseDto>()
                .ForMember(d => d.CourseId,    opt => opt.MapFrom(s => s.Id))
                .ForMember(d => d.CourseTitle, opt => opt.MapFrom(s => s.Title))
                .ForMember(d => d.CourseImage, opt => opt.MapFrom(s => s.ImageUrl))
                .ForMember(d => d.Status,      opt => opt.MapFrom(s => s.Status.ToString()));
        }
    }
}
