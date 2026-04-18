using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.Categories.Queries.GetCategoryStatsQuery;

public record GetCategoryStatsQuery : IRequest<CategoryStatsDto>;

public class GetCategoryStatsQueryHandler : IRequestHandler<GetCategoryStatsQuery, CategoryStatsDto>
{
    private readonly IApplicationDbContext _context;

    public GetCategoryStatsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CategoryStatsDto> Handle(GetCategoryStatsQuery request, CancellationToken cancellationToken)
    {
        // Query 1: SELECT COUNT(*) FROM Categories
        var totalCategories = await _context.Categories.CountAsync(cancellationToken);

        // Query 2: SELECT COUNT(*) FROM Categories WHERE EXISTS (SELECT 1 FROM Courses WHERE CategoryId = c.Id)
        var activeCategories = await _context.Categories.CountAsync(c => c.Courses.Any(), cancellationToken);
        var emptyCategories = totalCategories - activeCategories;

        // Query 3: SELECT COUNT(*) FROM Courses
        var totalCourseCount = await _context.Courses.CountAsync(cancellationToken);
        var avgCoursesPerCategory = totalCategories > 0
            ? Math.Round((double)totalCourseCount / totalCategories, 1)
            : 0;

        var top10 = await _context.Categories
            .Select(c => new CategoryComparisonItemDto
            {
                CategoryId = c.Id,
                Title = c.Title,
                CourseCount = c.Courses.Count(),
                EnrollmentCount = c.Courses.Sum(co => co.TotalStudents),
            })
            .OrderByDescending(c => c.CourseCount)
            .Take(10)
            .ToListAsync(cancellationToken);

        return new CategoryStatsDto
        {
            TotalCategories = totalCategories,
            ActiveCategories = activeCategories,
            EmptyCategories = emptyCategories,
            AvgCoursesPerCategory = avgCoursesPerCategory,
            CategoriesComparison = top10,
        };
    }
}
