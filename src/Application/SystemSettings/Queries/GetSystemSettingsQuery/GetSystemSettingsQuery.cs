using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.SystemSettings.Queries.GetSystemSettingsQuery;

public class GetSystemSettingsQuery : IRequest<List<SystemSettingDto>>
{
    public List<string> Keys { get; init; } = new();
}

public class GetSystemSettingsQueryHandler : IRequestHandler<GetSystemSettingsQuery, List<SystemSettingDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetSystemSettingsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<SystemSettingDto>> Handle(GetSystemSettingsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.SystemSettings.AsQueryable();

        if (request.Keys.Any())
        {
            query = query.Where(s => request.Keys.Contains(s.Key));
        }

        return await query
            .OrderBy(s => s.Key)
            .ProjectTo<SystemSettingDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
