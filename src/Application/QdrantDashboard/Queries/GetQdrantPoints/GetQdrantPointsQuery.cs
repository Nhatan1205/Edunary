#nullable enable

using System.Text.Json;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.SystemSettings.Queries.GetAIConfigQuery;
using Microsoft.Extensions.Logging;

namespace Edunary.Application.QdrantDashboard.Queries.GetQdrantPoints;

public record GetQdrantPointsQuery : IRequest<QdrantPointListDto>
{
    public string CollectionName { get; init; } = string.Empty;
    public int Limit { get; init; } = 20;
    public string? Offset { get; init; }
    public string? FilterKey { get; init; }
    public string? FilterValue { get; init; }
}

public class GetQdrantPointsQueryHandler
    : IRequestHandler<GetQdrantPointsQuery, QdrantPointListDto>
{
    private readonly ISender _sender;
    private readonly IAICenterClient _aiCenterClient;
    private readonly ILogger<GetQdrantPointsQueryHandler> _logger;

    public GetQdrantPointsQueryHandler(
        ISender sender,
        IAICenterClient aiCenterClient,
        ILogger<GetQdrantPointsQueryHandler> logger)
    {
        _sender = sender;
        _aiCenterClient = aiCenterClient;
        _logger = logger;
    }

    public async Task<QdrantPointListDto> Handle(GetQdrantPointsQuery request, CancellationToken ct)
    {
        var aiConfig = await _sender.Send(new GetAIConfigQuery(), ct);

        var payload = new
        {
            limit = request.Limit,
            offset = request.Offset,
            filter_key = request.FilterKey,
            filter_value = request.FilterValue,
            qdrant_config = (object?)null,
        };

        var url = $"{aiConfig.AICenterBaseUrl}api/qdrant/collections/{Uri.EscapeDataString(request.CollectionName)}/points";

        var (isSuccess, body) = await _aiCenterClient.PostAsync(
            url, aiConfig.AICenterApiKey, JsonSerializer.Serialize(payload), ct);

        if (!isSuccess)
        {
            _logger.LogError("AI Center GetQdrantPoints failed for '{Name}': {Body}",
                request.CollectionName, body);
            return new QdrantPointListDto();
        }

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        };
        return JsonSerializer.Deserialize<QdrantPointListDto>(body, options) ?? new();
    }
}
