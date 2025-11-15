using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Courses.Queries.GetCoursesWithPagination;
public record GetCoursesWithPaginationQuery : IRequest<PaginatedList<GetCourseDto>>
{
    public string SearchText { get; init; }
    public List<FilterData> FilterData { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class GetCoursesWithPaginationQueryHandler : IRequestHandler<GetCoursesWithPaginationQuery, PaginatedList<GetCourseDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IFilterService _filterService;

    public GetCoursesWithPaginationQueryHandler(IApplicationDbContext context, IMapper mapper, IFilterService filterService)
    {
        _context = context;
        _mapper = mapper;
        _filterService = filterService;
    }

    public async Task<PaginatedList<GetCourseDto>> Handle(GetCoursesWithPaginationQuery request, CancellationToken cancellationToken)
    {
        // base query
        var query = _context.Courses
            .OrderBy(x => x.Title)
            .AsQueryable();

        // search courses based on title and subtitle
        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            string search = request.SearchText.Trim().ToLower();
            query = query.Where(c =>
                c.Title.ToLower().Contains(search) ||
                c.Subtitle.ToLower().Contains(search)
            );
        }

        //filter courses
        query = _filterService.HandleFilters(query, request.FilterData);

        //get all courses by pagination
        PaginatedList<GetCourseDto> courses = await query
            .ProjectTo<GetCourseDto>(_mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);

        return courses;
    }
}
