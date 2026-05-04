using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Roadmaps.Queries.GetRoadmapTopicsQuery;

public class GetRoadmapTopicsQuery : IRequest<PaginatedList<RoadmapTopicDto>>
{
    public string SearchQuery { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 16;
}

public class GetRoadmapTopicsQueryHandler : IRequestHandler<GetRoadmapTopicsQuery, PaginatedList<RoadmapTopicDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetRoadmapTopicsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PaginatedList<RoadmapTopicDto>> Handle(GetRoadmapTopicsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.RoadmapTopics.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchQuery))
            query = query.Where(t => t.Title.Contains(request.SearchQuery));

        return await query
            .OrderBy(t => t.Title)
            .ProjectTo<RoadmapTopicDto>(_mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);
    }
}
