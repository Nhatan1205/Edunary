namespace Edunary.Application.Categories.Queries.GetAdminCategoriesWithPaginationQuery;

public class AdminCategoryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int CourseCount { get; set; }
    public int EnrollmentCount { get; set; }
    public DateTimeOffset Created { get; set; }
}
