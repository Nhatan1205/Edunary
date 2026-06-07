using System.Collections.Generic;

namespace Edunary.Application.AdminDashboard.Queries.GetAdminDashboardDistributionsQuery;

public class AdminDashboardDistributionsDto
{
    public List<DashboardCategoryComparisonItem> ByCategory { get; set; } = new();
    public List<DashboardTopicComparisonItem> ByTopic { get; set; } = new();
    public List<TopCourseItem> TopCourses { get; set; } = new();
    public List<PopularInstructorItem> PopularInstructors { get; set; } = new();
}

public class DashboardCategoryComparisonItem
{
    public int CategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int CourseCount { get; set; }
    public int EnrollmentCount { get; set; }
}

public class DashboardTopicComparisonItem
{
    public int TopicId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int CourseCount { get; set; }
    public int EnrollmentCount { get; set; }
}

public class TopCourseItem
{
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Thumbnail { get; set; } = string.Empty;
    public int Enrollments { get; set; }
}

public class PopularInstructorItem
{
    public string InstructorId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public string Headline { get; set; } = string.Empty;
    public int CoursesCount { get; set; }
    public double AvgRating { get; set; }
}
