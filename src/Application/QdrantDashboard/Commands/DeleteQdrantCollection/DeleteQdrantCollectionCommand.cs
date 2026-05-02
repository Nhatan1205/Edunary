#nullable enable

using System.Text.Json;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.SystemSettings.Queries.GetAIConfigQuery;
using Microsoft.Extensions.Logging;

namespace Edunary.Application.QdrantDashboard.Commands.DeleteQdrantCollection;

public record DeleteQdrantCollectionCommand(string CollectionName) : IRequest<Result>;

public class DeleteQdrantCollectionCommandHandler
    : IRequestHandler<DeleteQdrantCollectionCommand, Result>
{
    private readonly ISender _sender;
    private readonly IAICenterClient _aiCenterClient;
    private readonly ILogger<DeleteQdrantCollectionCommandHandler> _logger;

    public DeleteQdrantCollectionCommandHandler(
        ISender sender,
        IAICenterClient aiCenterClient,
        ILogger<DeleteQdrantCollectionCommandHandler> logger)
    {
        _sender = sender;
        _aiCenterClient = aiCenterClient;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteQdrantCollectionCommand request, CancellationToken ct)
    {
        var aiConfig = await _sender.Send(new GetAIConfigQuery(), ct);

        var payload = new
        {
            confirm = true,
            qdrant_config = (object?)null,
        };

        var url = $"{aiConfig.AICenterBaseUrl}api/qdrant/collections/{Uri.EscapeDataString(request.CollectionName)}/delete";

        _logger.LogWarning("Admin deleting Qdrant collection '{Name}'", request.CollectionName);

        var (isSuccess, body) = await _aiCenterClient.PostAsync(
            url, aiConfig.AICenterApiKey, JsonSerializer.Serialize(payload), ct);

        if (!isSuccess)
        {
            _logger.LogError("AI Center DeleteQdrantCollection failed for '{Name}': {Body}",
                request.CollectionName, body);
            return Result.Failure($"Failed to delete collection '{request.CollectionName}': {body}");
        }

        var response = JsonSerializer.Deserialize<JsonElement>(body);
        var message = response.TryGetProperty("message", out var msgEl)
            ? msgEl.GetString() ?? "Collection deleted."
            : "Collection deleted.";

        return Result.Success(message);
    }
}
