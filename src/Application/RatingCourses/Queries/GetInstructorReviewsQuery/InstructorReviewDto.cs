namespace Edunary.Application.RatingCourses.Queries.GetInstructorReviewsQuery;

// DTO representing student review for instructor
public class InstructorReviewDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string CourseImageUrl { get; set; }
    public float CourseRating { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public string StudentFullName { get; set; } = string.Empty;
    public string StudentAvatar { get; set; }
    public int Rating { get; set; }
    public string Review { get; set; } = string.Empty;
    public DateTimeOffset Created { get; set; }
    public DateTimeOffset LastModified { get; set; }
    public RatingResponseDto RatingResponse { get; set; }
}
