namespace Edunary.Application.AdminDashboard.Queries.GetAdminDashboardSummaryQuery;

public class AdminDashboardSummaryDto
{
    public int TotalUsers { get; set; }
    public double TotalUsersTrend { get; set; }  

    public int TotalCourses { get; set; }
    public double TotalCoursesTrend { get; set; }

    public decimal TotalRevenue { get; set; }
    public double TotalRevenueTrend { get; set; }

    // Today snapshot
    public int OnlineNow { get; set; }
    public decimal RevenueToday { get; set; }
    public int PendingActionsTotal { get; set; }

    // Pending actions widget
    public int PendingApprovals { get; set; }
    public int PendingWithdrawals { get; set; }
    public int PendingCourseChanges { get; set; }

    // Platform health gauges
    public double CompletionRate { get; set; }        
    public double AverageRating { get; set; }
    public double ActiveEnrollmentRate { get; set; }  

    // Course status distribution
    public int CourseStatusPublished { get; set; }
    public int CourseStatusPrivate { get; set; }
    public int CourseStatusDraft { get; set; }
    public int CourseStatusPendingReview { get; set; }
    public int CourseStatusNeedsChanges { get; set; }
}
