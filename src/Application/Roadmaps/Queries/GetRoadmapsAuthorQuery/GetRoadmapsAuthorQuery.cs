using Edunary.Application.Common.Behaviours;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;

namespace Edunary.Application.Roadmaps.Queries.GetRoadmapsAuthorQuery;

[ActivityLog(ActivityType.AccessUserRoadmapsPage, "Access user's roadmaps page")]
public class GetRoadmapsAuthorQuery : IRequest<PaginatedList<RoadmapAuthorDto>>
{
    public string SearchText { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}


public class GetRoadmapsAuthorQueryHandler : IRequestHandler<GetRoadmapsAuthorQuery, PaginatedList<RoadmapAuthorDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public GetRoadmapsAuthorQueryHandler(IApplicationDbContext context, IMapper mapper, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<PaginatedList<RoadmapAuthorDto>> Handle(GetRoadmapsAuthorQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;

        var query = _context.Roadmaps
            .Where(r => r.CreatedBy == userId && r.Source == RoadmapSource.Manual)
            .AsQueryable();

        // search by title
        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            string search = request.SearchText.Trim().ToLower();
            query = query.Where(r => r.Title.ToLower().Contains(search));
        }

        // order by newest first
        query = query.OrderByDescending(r => r.Created);

        return await query
            .ProjectTo<RoadmapAuthorDto>(_mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);
    }
}
