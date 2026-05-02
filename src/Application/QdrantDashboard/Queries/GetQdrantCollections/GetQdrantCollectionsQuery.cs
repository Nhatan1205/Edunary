#nullable enable

using System.Text.Json;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.SystemSettings.Queries.GetAIConfigQuery;
using Microsoft.Extensions.Logging;

namespace Edunary.Application.QdrantDashboard.Queries.GetQdrantCollections;

public record GetQdrantCollectionsQuery : IRequest<QdrantCollectionListDto>;

public class GetQdrantCollectionsQueryHandler
    : IRequestHandler<GetQdrantCollectionsQuery, QdrantCollectionListDto>
{
    private readonly ISender _sender;
    private readonly IAICenterClient _aiCenterClient;
    private readonly ILogger<GetQdrantCollectionsQueryHandler> _logger;

    public GetQdrantCollectionsQueryHandler(
        ISender sender,
        IAICenterClient aiCenterClient,
        ILogger<GetQdrantCollectionsQueryHandler> logger)
    {
        _sender = sender;
        _aiCenterClient = aiCenterClient;
        _logger = logger;
    }

    public async Task<QdrantCollectionListDto> Handle(GetQdrantCollectionsQuery request, CancellationToken ct)
    {
        var aiConfig = await _sender.Send(new GetAIConfigQuery(), ct);

        var payload = new { qdrant_config = (object?)null };
        var url = $"{aiConfig.AICenterBaseUrl}api/qdrant/collections";

        var (isSuccess, body) = await _aiCenterClient.PostAsync(
            url, aiConfig.AICenterApiKey, JsonSerializer.Serialize(payload), ct);

        if (!isSuccess)
        {
            _logger.LogError("AI Center GetQdrantCollections failed: {Body}", body);
            return new QdrantCollectionListDto();
        }

        var response = JsonSerializer.Deserialize<JsonElement>(body);
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        };

        var collections = JsonSerializer.Deserialize<List<CollectionSummaryDto>>(
            response.GetProperty("collections").GetRawText(), options) ?? new();

        return new QdrantCollectionListDto
        {
            Collections = collections,
            Total = collections.Count,
        };
    }
}
