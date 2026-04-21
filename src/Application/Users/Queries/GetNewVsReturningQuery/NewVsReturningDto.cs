namespace Edunary.Application.Users.Queries.GetNewVsReturningQuery;

public class NewVsReturningDto
{
    public int Year { get; set; }
    public List<string> Labels { get; set; } = new();
    public List<int> NewUsers { get; set; } = new();

    /// <summary>
    /// Users who existed before the month AND logged in during that month.
    /// #TODO: Cannot be accurately calculated with current schema.
    /// LastLoginTime only stores the LAST login — not per-month login history.
    /// Currently returns 0 for all months as placeholder.
    /// Future fix: Add LoginHistory entity to track per-login timestamps,
    /// then query: COUNT WHERE CreatedAt &lt; month_start AND MONTH(LoginDate) = m AND YEAR(LoginDate) = year
    /// </summary>
    public List<int> ReturningUsers { get; set; } = new();
}
