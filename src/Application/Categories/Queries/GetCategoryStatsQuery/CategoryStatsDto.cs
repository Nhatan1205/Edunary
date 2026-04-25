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

    /// <summary>Per-category comparison data for the bar chart (top 10 by courseCount).</summary>
    public IList<CategoryComparisonItemDto> CategoriesComparison { get; set; } = new List<CategoryComparisonItemDto>();
}

public class CategoryComparisonItemDto
{
    public int CategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int CourseCount { get; set; }
    public int EnrollmentCount { get; set; }
}
