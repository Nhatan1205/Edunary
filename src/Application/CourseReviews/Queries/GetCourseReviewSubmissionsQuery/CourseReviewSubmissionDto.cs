namespace Edunary.Application.CourseReviews.Queries.GetCourseReviewSubmissionsQuery;

public class CourseReviewSubmissionDto
{
    public int SubmissionId { get; set; }
    public int CourseId { get; set; }
    public string Title { get; set; }
    public string ImageUrl { get; set; }
    public string CategoryName { get; set; }
    public string InstructorId { get; set; }
    public string InstructorName { get; set; }
    public string InstructorAvatar { get; set; }
    public int SubmissionNumber { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
}
