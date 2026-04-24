using Edunary.Application.Common.Behaviours;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;

namespace Edunary.Application.Announcements.Queries.GetAnnouncementsQuery;

[ActivityLog(ActivityType.AccessUserAnnouncementsPage, "Access User Announcements page")]

public class GetAnnouncementsQuery : IRequest<PaginatedList<GetAnnouncementDto>>
{
    public AnnouncementStatus Status { get; set; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class GetAnnouncementsQueryHandler : IRequestHandler<GetAnnouncementsQuery, PaginatedList<GetAnnouncementDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;
    public GetAnnouncementsQueryHandler(IApplicationDbContext context, IMapper mapper, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }
    public async Task<PaginatedList<GetAnnouncementDto>> Handle(GetAnnouncementsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;
        return await _context.Announcements
            .Where(x => x.Status == request.Status && x.CreatedBy == userId)
            .OrderByDescending(x => x.Created)
            .ProjectTo<GetAnnouncementDto>(_mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);
    }
}
