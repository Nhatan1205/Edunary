using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Constants;

namespace Edunary.Application.SystemSettings.Queries.GetPublicSystemSettingsQuery;

public class GetPublicSystemSettingsQuery : IRequest<Dictionary<string, string>>
{
    public List<string> Keys { get; init; } = new();
}

public class GetPublicSystemSettingsQueryHandler
    : IRequestHandler<GetPublicSystemSettingsQuery, Dictionary<string, string>>
{
    private readonly IApplicationDbContext _context;

    public GetPublicSystemSettingsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Dictionary<string, string>> Handle(
        GetPublicSystemSettingsQuery request, CancellationToken cancellationToken)
    {
        //only public key can be requested
        var allowedKeys = request.Keys.Any()
            ? request.Keys.Where(SettingKey.IsPublicKey).ToList()
            : SettingKey.GetPublicKeys().ToList();

        if (!allowedKeys.Any())
        {
            return new Dictionary<string, string>();
        }

        var dbSettings = await _context.SystemSettings
            .Where(s => allowedKeys.Contains(s.Key))
            .ToListAsync(cancellationToken);

        var result = new Dictionary<string, string>();
        foreach (var key in allowedKeys)
        {
            var setting = dbSettings.FirstOrDefault(s => s.Key == key);
            result[key] = setting?.Value ?? string.Empty;
        }

        return result;
    }
}
