using Edunary.Application.Categories.Queries.GetCategoriesWithPagination;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Courses.Queries.GetCoursesWithPagination;
public record GetCoursesWithPaginationQuery : IRequest<PaginatedList<GetCourseDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class GetCoursesWithPaginationQueryHandler : IRequestHandler<GetCoursesWithPaginationQuery, PaginatedList<GetCourseDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetCoursesWithPaginationQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PaginatedList<GetCourseDto>> Handle(GetCoursesWithPaginationQuery request, CancellationToken cancellationToken)
    {
            return await _context.Courses
            .Include(c => c.Category)
            .OrderBy(x => x.Title)
            .ProjectTo<GetCourseDto>(_mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);
    }
}
