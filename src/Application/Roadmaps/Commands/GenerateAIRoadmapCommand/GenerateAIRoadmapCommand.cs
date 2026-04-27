using System.Text.Json;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.SystemSettings.Queries.GetAIConfigQuery;
using Microsoft.Extensions.Logging;

namespace Edunary.Application.Roadmaps.Commands.GenerateAIRoadmapCommand;

public record GenerateAIRoadmapCommand : IRequest<ReturnResult<AIRoadmapResultDto>>
{
    public string Topic { get; init; } = "";
    public string Level { get; init; } = "Beginner";
}

public class GenerateAIRoadmapCommandHandler : IRequestHandler<GenerateAIRoadmapCommand, ReturnResult<AIRoadmapResultDto>>
{
    private readonly IMediator _mediator;
    private readonly IAICenterClient _aiCenterClient;
    private readonly ILogger<GenerateAIRoadmapCommandHandler> _logger;

    public GenerateAIRoadmapCommandHandler(
        IMediator mediator,
        IAICenterClient aiCenterClient,
        ILogger<GenerateAIRoadmapCommandHandler> logger)
    {
        _mediator = mediator;
        _aiCenterClient = aiCenterClient;
        _logger = logger;
    }

    public async Task<ReturnResult<AIRoadmapResultDto>> Handle(GenerateAIRoadmapCommand request, CancellationToken ct)
    {
        try
        {
            // 1. Get AI config from DB
            var config = await _mediator.Send(new GetAIConfigQuery(), ct);

            // 2. Build payload
            var payload = new
            {
                topic = request.Topic,
                level = request.Level,
                llm_config = new
                {
                    model_name = config.LLMModelName,
                    api_key = config.LLMApiKey,
                    api_base = config.LLMBaseUrl,
                    temperature = config.LLMTemperature,
                    max_tokens = config.LLMMaxTokens,
                }
            };

            var jsonBody = JsonSerializer.Serialize(payload);
            var url = $"{config.AICenterBaseUrl}api/roadmap/generate";

            // 3. Call AI Center
            var (isSuccess, body) = await _aiCenterClient.PostAsync(url, config.AICenterApiKey, jsonBody, ct);

            if (!isSuccess)
            {
                _logger.LogError("AI Center error: {Body}", body);
                return new ReturnResult<AIRoadmapResultDto>
                {
                    Result = null,
                    Message = "AI roadmap generation failed"
                };
            }

            // 4. Parse response
            var aiResponse = JsonSerializer.Deserialize<JsonElement>(body);
            var data = aiResponse.GetProperty("data").GetRawText();
            var roadmapData = JsonSerializer.Deserialize<AIRoadmapResultDto>(data,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return new ReturnResult<AIRoadmapResultDto>
            {
                Result = roadmapData,
                Message = "Roadmap generated successfully"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError("GenerateAIRoadmap failed: {Error}", ex.Message);
            return new ReturnResult<AIRoadmapResultDto>
            {
                Result = null,
                Message = $"An error occurred: {ex.Message}"
            };
        }
    }
}
