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
            // AI Center
            SettingKey.AICenter_BaseUrl, SettingKey.AICenter_ApiKey,
            // LLM
            SettingKey.LLM_ModelName, SettingKey.LLM_ApiKey,
            SettingKey.LLM_BaseUrl, SettingKey.LLM_Temperature, SettingKey.LLM_MaxTokens,
            // Embedding
            SettingKey.Embedding_Provider, SettingKey.Embedding_ModelName,
            SettingKey.Embedding_ApiKey, SettingKey.Embedding_BaseUrl,
            // Qdrant
            SettingKey.Qdrant_Url, SettingKey.Qdrant_ApiKey, SettingKey.Qdrant_Collection,
            // STT
            SettingKey.STT_ApiKey, SettingKey.STT_ModelName,
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
            EmbeddingProvider = settings.GetValueOrDefault(SettingKey.Embedding_Provider, ""),
            EmbeddingModelName = settings.GetValueOrDefault(SettingKey.Embedding_ModelName, ""),
            EmbeddingApiKey = settings.GetValueOrDefault(SettingKey.Embedding_ApiKey, ""),
            EmbeddingBaseUrl = settings.GetValueOrDefault(SettingKey.Embedding_BaseUrl, ""),
            QdrantUrl = settings.GetValueOrDefault(SettingKey.Qdrant_Url, ""),
            QdrantApiKey = settings.GetValueOrDefault(SettingKey.Qdrant_ApiKey, ""),
            QdrantCollection = settings.GetValueOrDefault(SettingKey.Qdrant_Collection, "edunary_docs")!,
            STTApiKey = settings.GetValueOrDefault(SettingKey.STT_ApiKey, ""),
            STTModelName = settings.GetValueOrDefault(SettingKey.STT_ModelName, "whisper-1"),
        };
    }
}
