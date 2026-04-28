using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;

namespace Edunary.Application.CourseTopics.Queries.GetCourseTopics;

public record GetCourseTopicsQuery : IRequest<PaginatedList<GetCourseTopicDto>>
{
    public string SearchText { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}

public class GetCourseTopicsQueryHandler : IRequestHandler<GetCourseTopicsQuery, PaginatedList<GetCourseTopicDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetCourseTopicsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PaginatedList<GetCourseTopicDto>> Handle(GetCourseTopicsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.CourseTopics
            .Include(t => t.Courses)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            var search = request.SearchText.Trim().ToLower();
            query = query.Where(t => t.Name.ToLower().Contains(search));
        }

        return await query
            .OrderBy(t => t.Name)
            .ProjectTo<GetCourseTopicDto>(_mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);
    }
}

