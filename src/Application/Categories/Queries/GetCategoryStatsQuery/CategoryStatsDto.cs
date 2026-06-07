namespace Edunary.Application.Categories.Queries.GetCategoryStatsQuery;

/// <summary>
/// Summary stats for the Category List Page overview cards.
/// </summary>
public class CategoryStatsDto
{
    public int TotalCategories { get; set; }

    /// <summary>Categories that have at least 1 Published course.</summary>
    public int ActiveCategories { get; set; }

    /// <summary>Categories that have 0 courses.</summary>
    public int EmptyCategories { get; set; }

    /// <summary>Average number of courses per category (rounded to 1 decimal).</summary>
    public double AvgCoursesPerCategory { get; set; }
}
