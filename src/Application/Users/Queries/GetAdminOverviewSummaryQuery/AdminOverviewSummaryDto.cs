namespace Edunary.Application.Users.Queries.GetAdminOverviewSummaryQuery;

public class AdminOverviewSummaryDto
{
    //Stat Cards
    public int ActiveUsers { get; set; }
    public double ActiveUsersTrend { get; set; }   
    public int NewUsers30d { get; set; }
    public double NewUsersTrend { get; set; }      
    public int OnlineNow { get; set; }

    //Status Distribution
    public int StatusActive { get; set; }
    public int StatusInactive { get; set; }
    public int StatusSuspended { get; set; }
    public int StatusBanned { get; set; }

    //Top Active Users 
    public List<TopActiveUserDto> TopActiveUsers { get; set; } = new();
}

public class TopActiveUserDto
{
    public string Id { get; set; }
    public string FullName { get; set; }
    public string Avatar { get; set; }
    public int EnrolledCount { get; set; }
    public string LastLogin { get; set; }   // relative time: "2 hours ago"
}
