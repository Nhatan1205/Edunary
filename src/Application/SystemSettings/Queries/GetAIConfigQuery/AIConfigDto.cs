namespace Edunary.Application.SystemSettings.Queries.GetAIConfigQuery;

public class AIConfigDto
{
    public string AICenterBaseUrl { get; set; } = "";
    public string AICenterApiKey { get; set; } = "";
    public string LLMModelName { get; set; } = "";
    public string LLMApiKey { get; set; } = "";
    public string LLMBaseUrl { get; set; } = "";
    public double LLMTemperature { get; set; } = 0.7;
    public int LLMMaxTokens { get; set; } = 2048;
}
