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

        // Enrich creator info — one GetUserById call per unique creator
        // (GetUserById = 1 FindByIdAsync, vs calling GetFullNameAsync + GetUserAvatarAsync = 2 FindByIdAsync)
        var creatorIds = result.Items
            .Select(r => r.Creator?.Id)
            .Where(id => !string.IsNullOrEmpty(id))
            .Distinct()
            .ToList();

        var creatorInfos = new Dictionary<string, (string Name, string Avatar)>();

        foreach (var creatorId in creatorIds)
        {
            var user = await _identityService.GetUserById(creatorId);
            creatorInfos[creatorId] = (user?.FullName ?? user?.UserName, user?.Avatar);
        }

        foreach (var item in result.Items)
        {
            if (!string.IsNullOrEmpty(item.Creator?.Id) && creatorInfos.TryGetValue(item.Creator.Id, out var info))
            {
                item.Creator.Name = info.Name;
                item.Creator.Avatar = info.Avatar;
            }
        }

        return result;
    }
}
