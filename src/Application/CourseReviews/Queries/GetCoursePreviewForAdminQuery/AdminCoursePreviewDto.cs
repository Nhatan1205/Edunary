using Edunary.Application.CourseProgresses.Commands.UpdateCourseProgressCommand;
using Edunary.Domain.Enums;

namespace Edunary.Application.CourseReviews.Queries.GetCoursePreviewForAdminQuery;

public class AdminCoursePreviewDto
{
    public CourseInfoDto Course { get; set; }
    public AdminSubmissionInfoDto SubmissionInfo { get; set; }
    public List<AdminFeedbackDto> CurrentFeedbacks { get; set; } = new();
    public List<SectionSchema> CurriculumSections { get; set; } = new();
}

public class CourseInfoDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Subtitle { get; set; }
    public string Description { get; set; }
    public CourseLevel Level { get; set; }
    public CourseStatus Status { get; set; }
    public string LearningObjectives { get; set; }
    public string Requirements { get; set; }
    public string TargetAudience { get; set; }
    public string ImageUrl { get; set; }
    public string WelcomeMessage { get; set; }
    public string CongratulationsMessage { get; set; }
    public float Price { get; set; }
    public int CategoryId { get; set; }
    public string CategoryTitle { get; set; }
    public float Ratings { get; set; }
    public int TotalStudents { get; set; }
    public string Content { get; set; }
    public DateTimeOffset LastModified { get; set; }
    public string InstructorId { get; set; }
    public string InstructorName { get; set; }
    public string InstructorAvatar { get; set; }
    public List<Topics> Topics { get; set; } = new();
}

public class Topics
{
    public int Id { get; set; }
    public string Name { get; set; }
}

public class AdminSubmissionInfoDto
{
    public int SubmissionId { get; set; }
    public int SubmissionNumber { get; set; }
    public ReviewSubmissionStatus Status { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
    public string AdminNote { get; set; }
}

public class AdminFeedbackDto
{
    public int Id { get; set; }
    public ReviewFeedbackType FeedbackType { get; set; }
    public ReviewFeedbackCategory Category { get; set; }
    public string Content { get; set; }
    public bool IsResolved { get; set; }
}
