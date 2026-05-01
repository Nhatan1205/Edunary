using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Constants;

namespace Edunary.Application.SystemSettings.Queries.GetAIConfigQuery;

public record GetAIConfigQuery : IRequest<AIConfigDto>;

public class GetAIConfigQueryHandler : IRequestHandler<GetAIConfigQuery, AIConfigDto>
{
    private readonly IApplicationDbContext _context;

    public GetAIConfigQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AIConfigDto> Handle(GetAIConfigQuery request, CancellationToken ct)
    {
        var keys = new[]
        {
            SettingKey.AICenter_BaseUrl, SettingKey.AICenter_ApiKey,
            SettingKey.LLM_ModelName, SettingKey.LLM_ApiKey,
            SettingKey.LLM_BaseUrl, SettingKey.LLM_Temperature, SettingKey.LLM_MaxTokens,
        };

        var settings = await _context.SystemSettings
            .Where(s => keys.Contains(s.Key))
            .ToDictionaryAsync(s => s.Key, s => s.Value, ct);

        return new AIConfigDto
        {
            AICenterBaseUrl = settings.GetValueOrDefault(SettingKey.AICenter_BaseUrl, ""),
            AICenterApiKey = settings.GetValueOrDefault(SettingKey.AICenter_ApiKey, ""),
            LLMModelName = settings.GetValueOrDefault(SettingKey.LLM_ModelName, ""),
            LLMApiKey = settings.GetValueOrDefault(SettingKey.LLM_ApiKey, ""),
            LLMBaseUrl = settings.GetValueOrDefault(SettingKey.LLM_BaseUrl, ""),
            LLMTemperature = double.TryParse(settings.GetValueOrDefault(SettingKey.LLM_Temperature), out var temp) ? temp : 0.7,
            LLMMaxTokens = int.TryParse(settings.GetValueOrDefault(SettingKey.LLM_MaxTokens), out var tokens) ? tokens : 2048,
        };
    }
}
