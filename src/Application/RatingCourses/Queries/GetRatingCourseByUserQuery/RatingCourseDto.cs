namespace Edunary.Application.RatingCourses.Queries.GetRatingCourseByUserQuery;

public class RatingCourseDto
{
    public int Id { get; set; }
    public int? CourseId { get; set; }
    public int Rating { get; set; }
    public string Review { get; set; } = string.Empty;
    public DateTimeOffset LastModified { get; set; }
}
