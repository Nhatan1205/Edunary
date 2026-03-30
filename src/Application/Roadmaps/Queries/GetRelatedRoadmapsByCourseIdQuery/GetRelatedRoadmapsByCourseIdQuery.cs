using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.Roadmaps.Queries.GetRelatedRoadmapsByCourseIdQuery;

public class GetRelatedRoadmapsByCourseIdQuery : IRequest<List<RelatedRoadmapDto>>
{
    public int CourseId { get; init; }
}

public class GetRelatedRoadmapsByCourseIdQueryHandler
    : IRequestHandler<GetRelatedRoadmapsByCourseIdQuery, List<RelatedRoadmapDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetRelatedRoadmapsByCourseIdQueryHandler(
        IApplicationDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<RelatedRoadmapDto>> Handle(
        GetRelatedRoadmapsByCourseIdQuery request,
        CancellationToken cancellationToken)
    {
        return await _context.Roadmaps
            .Where(r => r.IsPublic && r.GraphData.Contains($"\"courseId\":{request.CourseId},"))
            .OrderByDescending(r => r.Created)
            .Take(6)
            .ProjectTo<RelatedRoadmapDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
