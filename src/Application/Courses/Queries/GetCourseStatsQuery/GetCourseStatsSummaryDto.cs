namespace Edunary.Application.Courses.Queries.GetCourseStatsQuery;
public class GetCourseStatsSummaryDto
{
    public int TotalEnrollments { get; set; }
    public int TotalEnrollmentsThisMonth { get; set; }
    public float TotalRevenue { get; set; }
    public float TotalRevenueThisMonth { get; set; }
    public float AverageRating { get; set; }
    public float AverageRatingThisMonth { get; set; }
}

