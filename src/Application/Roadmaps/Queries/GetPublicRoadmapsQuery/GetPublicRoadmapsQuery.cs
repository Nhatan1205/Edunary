using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Roadmaps.Queries.GetPublicRoadmapsQuery;

public class GetPublicRoadmapsQuery : IRequest<PaginatedList<PublicRoadmapListDto>>
{
    public int? RoadmapTopicId { get; init; }
    public string SearchText { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class GetPublicRoadmapsQueryHandler : IRequestHandler<GetPublicRoadmapsQuery, PaginatedList<PublicRoadmapListDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IIdentityService _identityService;

    public GetPublicRoadmapsQueryHandler(IApplicationDbContext context, IMapper mapper, IIdentityService identityService)
    {
        _context = context;
        _mapper = mapper;
        _identityService = identityService;
    }

    public async Task<PaginatedList<PublicRoadmapListDto>> Handle(GetPublicRoadmapsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Roadmaps
            .Where(r => r.IsPublic)
            .AsQueryable();

        // Filter by topic
        if (request.RoadmapTopicId.HasValue)
        {
            query = query.Where(r => r.RoadmapTopicId == request.RoadmapTopicId.Value);
        }

        // Search by title
        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            string search = request.SearchText.Trim().ToLower();
            query = query.Where(r => r.Title.ToLower().Contains(search));
        }

        // Order by newest first
        query = query.OrderByDescending(r => r.Created);

        var result = await query
            .ProjectTo<PublicRoadmapListDto>(_mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);

        // Enrich creator info
        var creatorIds = result.Items
            .Select(r => r.Creator?.Id)
            .Where(id => !string.IsNullOrEmpty(id))
            .Distinct()
            .ToList();

        var creatorNames = new Dictionary<string, string>();
        var creatorAvatars = new Dictionary<string, string>();

        foreach (var creatorId in creatorIds)
        {
            creatorNames[creatorId] = await _identityService.GetFullNameAsync(creatorId);
            creatorAvatars[creatorId] = await _identityService.GetUserAvatarAsync(creatorId);
        }

        foreach (var item in result.Items)
        {
            if (!string.IsNullOrEmpty(item.Creator?.Id))
            {
                item.Creator.Name = creatorNames.GetValueOrDefault(item.Creator.Id);
                item.Creator.Avatar = creatorAvatars.GetValueOrDefault(item.Creator.Id);
            }
        }

        return result;
    }
}
