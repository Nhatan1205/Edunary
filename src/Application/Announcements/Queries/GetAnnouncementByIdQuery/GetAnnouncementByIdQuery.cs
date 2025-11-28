using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.Announcements.Queries.GetAnnouncementByIdQuery;
public class GetAnnouncementByIdQuery : IRequest<GetAnnouncementByIdDto>
{
    public int Id { get; init; }
}

public class GetAnnouncementByIdQueryHandler : IRequestHandler<GetAnnouncementByIdQuery, GetAnnouncementByIdDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public GetAnnouncementByIdQueryHandler(
        IApplicationDbContext context,
        IMapper mapper,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<GetAnnouncementByIdDto> Handle(GetAnnouncementByIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;
        return await _context.Announcements
            .Where(c => c.Id == request.Id && c.CreatedBy == userId)
            .ProjectTo<GetAnnouncementByIdDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);
    }
}

