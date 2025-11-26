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
}
