namespace Edunary.Application.AdminDashboard.Queries.GetAdminDashboardTrendQuery;

public class AdminDashboardTrendDto
{
    public string Period { get; set; } = string.Empty;
    public List<string> Labels { get; set; } = new();
    public List<int> Enrollments { get; set; } = new();
    public List<decimal> Revenue { get; set; } = new();
}
