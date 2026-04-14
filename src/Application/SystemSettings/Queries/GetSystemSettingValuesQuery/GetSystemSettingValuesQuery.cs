using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.SystemSettings.Queries.GetSystemSettingValuesQuery;

public class GetSystemSettingValuesQuery : IRequest<Dictionary<string, string>>
{
    public List<string> Keys { get; init; } = new();
}

public class GetSystemSettingValuesQueryHandler : IRequestHandler<GetSystemSettingValuesQuery, Dictionary<string, string>>
{
    private readonly IApplicationDbContext _context;

    public GetSystemSettingValuesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Dictionary<string, string>> Handle(GetSystemSettingValuesQuery request, CancellationToken cancellationToken)
    {
        var dbSettings = await _context.SystemSettings
            .Where(s => request.Keys.Contains(s.Key))
            .ToListAsync(cancellationToken);

        var result = new Dictionary<string, string>();

        foreach (var key in request.Keys)
        {
            var setting = dbSettings.FirstOrDefault(s => s.Key == key);
            result[key] = setting?.Value ?? string.Empty;
        }

        return result;
    }
}
