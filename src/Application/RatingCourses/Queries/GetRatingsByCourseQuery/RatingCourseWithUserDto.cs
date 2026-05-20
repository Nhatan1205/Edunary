namespace Edunary.Application.RatingCourses.Queries.GetRatingsByCourseQuery;

public class RatingCourseWithUserDto
{
    public int Id { get; set; }
    public int? CourseId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserFullName { get; set; } = string.Empty;
    public string UserAvatar { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Review { get; set; } = string.Empty;
    public DateTimeOffset Created { get; set; }
    public DateTimeOffset LastModified { get; set; }
    public RatingResponseDto RatingResponse { get; set; }
}

public class RatingResponseDto
{
    public int Id { get; set; }
    public string ResponseText { get; set; } = string.Empty;
    public string RespondedBy { get; set; } = string.Empty;
    public string InstructorFullName { get; set; } = string.Empty;
    public string InstructorAvatar { get; set; } = string.Empty;
    public DateTimeOffset RespondedAt { get; set; }
}
