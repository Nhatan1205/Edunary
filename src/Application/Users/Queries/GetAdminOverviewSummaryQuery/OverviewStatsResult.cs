namespace Edunary.Application.Users.Queries.GetAdminOverviewSummaryQuery;

public class OverviewStatsResult
{
    public int ActiveUsers { get; set; }
    public double ActiveUsersTrend { get; set; }
    public int NewUsers30d { get; set; }
    public double NewUsersTrend { get; set; }

    public int StatusActive { get; set; }
    public int StatusInactive { get; set; }
    public int StatusSuspended { get; set; }
    public int StatusBanned { get; set; }
}
