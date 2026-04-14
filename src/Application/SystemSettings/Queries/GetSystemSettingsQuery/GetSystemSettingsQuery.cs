using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Constants;

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

        var results = await query
            .OrderBy(s => s.Key)
            .ProjectTo<SystemSettingDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        foreach (var dto in results)
        {
            if (SensitiveKeys.Contains(dto.Key) && !string.IsNullOrEmpty(dto.Value))
            {
                dto.Value = dto.Value.Length > 4
                    ? "••••••••" + dto.Value[^4..]
                    : "••••••••";
            }
        }

        return results;
    }

    private static readonly HashSet<string> SensitiveKeys = new()
    {
        SettingKey.Stripe_SecretKey,
        SettingKey.Cloudinary_ApiSecret,
        SettingKey.DigitalOcean_SecretKey,
        SettingKey.DigitalOcean_AccessKey,
        SettingKey.Email_Password,
    };
}
