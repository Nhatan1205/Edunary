#nullable enable

using System.Text.Json;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.SystemSettings.Queries.GetAIConfigQuery;
using Microsoft.Extensions.Logging;

namespace Edunary.Application.QdrantDashboard.Queries.GetQdrantCollectionInfo;

public record GetQdrantCollectionInfoQuery(string CollectionName)
    : IRequest<QdrantCollectionInfoDto?>;

public class GetQdrantCollectionInfoQueryHandler
    : IRequestHandler<GetQdrantCollectionInfoQuery, QdrantCollectionInfoDto?>
{
    private readonly ISender _sender;
    private readonly IAICenterClient _aiCenterClient;
    private readonly ILogger<GetQdrantCollectionInfoQueryHandler> _logger;

    public GetQdrantCollectionInfoQueryHandler(
        ISender sender,
        IAICenterClient aiCenterClient,
        ILogger<GetQdrantCollectionInfoQueryHandler> logger)
    {
        _sender = sender;
        _aiCenterClient = aiCenterClient;
        _logger = logger;
    }

    public async Task<QdrantCollectionInfoDto?> Handle(
        GetQdrantCollectionInfoQuery request, CancellationToken ct)
    {
        var aiConfig = await _sender.Send(new GetAIConfigQuery(), ct);

        var payload = new { qdrant_config = (object?)null };
        var url = $"{aiConfig.AICenterBaseUrl}api/qdrant/collections/{Uri.EscapeDataString(request.CollectionName)}/info";

        var (isSuccess, body) = await _aiCenterClient.PostAsync(
            url, aiConfig.AICenterApiKey, JsonSerializer.Serialize(payload), ct);

        if (!isSuccess)
        {
            _logger.LogError("AI Center GetQdrantCollectionInfo failed for '{Name}': {Body}",
                request.CollectionName, body);
            return null;
        }

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        };
        return JsonSerializer.Deserialize<QdrantCollectionInfoDto>(body, options);
    }
}
