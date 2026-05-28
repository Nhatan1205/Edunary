namespace Edunary.Application.Finance.Queries.GetTopCoursesByRevenue;

public class TopCourseRevenueDto
{
    public int CourseId { get; init; }
    public string CourseName { get; init; } = "";
    public decimal TotalRevenue { get; init; }
    public int OrderCount { get; init; }
}
