using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.Roadmaps.Queries.GetRoadmapTopicsQuery;

public class GetRoadmapTopicsQuery : IRequest<List<RoadmapTopicDto>> { }

public class GetRoadmapTopicsQueryHandler : IRequestHandler<GetRoadmapTopicsQuery, List<RoadmapTopicDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetRoadmapTopicsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<RoadmapTopicDto>> Handle(GetRoadmapTopicsQuery request, CancellationToken cancellationToken)
    {
        return await _context.RoadmapTopics
            .OrderBy(t => t.Title)
            .ProjectTo<RoadmapTopicDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}

