using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Categories.Queries.GetAdminCategoriesWithPaginationQuery;

public record GetAdminCategoriesWithPaginationQuery : IRequest<PaginatedList<AdminCategoryDto>>
{
    public string SearchText { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class GetAdminCategoriesWithPaginationQueryHandler
    : IRequestHandler<GetAdminCategoriesWithPaginationQuery, PaginatedList<AdminCategoryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAdminCategoriesWithPaginationQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedList<AdminCategoryDto>> Handle(
        GetAdminCategoriesWithPaginationQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Categories.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            var search = request.SearchText.Trim().ToLower();
            query = query.Where(c => c.Title.ToLower().Contains(search));
        }

        return await query
            .OrderBy(c => c.Title)
            .Select(c => new AdminCategoryDto
            {
                Id = c.Id,
                Title = c.Title,
                CourseCount = c.Courses.Count(),
                EnrollmentCount = c.Courses.Sum(co => co.TotalStudents),
                Created = c.Created,
            })
            .PaginatedListAsync(request.PageNumber, request.PageSize);
    }
}
