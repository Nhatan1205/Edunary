namespace Edunary.Application.RatingCourses.Queries.GetInstructorReviewsQuery;

// DTO representing instructor response info
public class RatingResponseDto
{
    public int Id { get; set; }
    public string ResponseText { get; set; } = string.Empty;
    public string RespondedBy { get; set; } = string.Empty;
    public string InstructorFullName { get; set; } = string.Empty;
    public string InstructorAvatar { get; set; } = string.Empty;
    public DateTimeOffset RespondedAt { get; set; }
}
