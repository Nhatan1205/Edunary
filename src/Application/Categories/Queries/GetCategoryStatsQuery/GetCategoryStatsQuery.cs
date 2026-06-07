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
        var totalCategories = await _context.Categories.CountAsync(cancellationToken);

        var activeCategories = await _context.Categories.CountAsync(c => c.Courses.Any(), cancellationToken);
        var emptyCategories = totalCategories - activeCategories;

        var totalCourseCount = await _context.Courses.CountAsync(cancellationToken);
        var avgCoursesPerCategory = totalCategories > 0
            ? Math.Round((double)totalCourseCount / totalCategories, 1)
            : 0;

        return new CategoryStatsDto
        {
            TotalCategories = totalCategories,
            ActiveCategories = activeCategories,
            EmptyCategories = emptyCategories,
            AvgCoursesPerCategory = avgCoursesPerCategory,
        };
    }
}
