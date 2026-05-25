namespace Edunary.Application.CourseReviews.Queries.GetCourseReviewSubmissionsCountsQuery;

public class CourseReviewSubmissionsCountsDto
{
    public int PendingCount { get; set; }
    public int NeedsChangesCount { get; set; }
    public int ApprovedCount { get; set; }
}
