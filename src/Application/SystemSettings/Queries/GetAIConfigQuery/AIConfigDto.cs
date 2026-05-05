namespace Edunary.Application.SystemSettings.Queries.GetAIConfigQuery;

public class AIConfigDto
{
    // AI Center
    public string AICenterBaseUrl { get; set; } = "";
    public string AICenterApiKey { get; set; } = "";

    // LLM
    public string LLMModelName { get; set; } = "";
    public string LLMApiKey { get; set; } = "";
    public string LLMBaseUrl { get; set; } = "";
    public double LLMTemperature { get; set; } = 0.7;
    public int LLMMaxTokens { get; set; } = 2048;

    // Embedding
    public string EmbeddingProvider { get; set; } = "";
    public string EmbeddingModelName { get; set; } = "";
    public string EmbeddingApiKey { get; set; } = "";
    public string EmbeddingBaseUrl { get; set; } = "";

    // Qdrant
    public string QdrantUrl { get; set; } = "";
    public string QdrantApiKey { get; set; } = "";
    public string QdrantCollection { get; set; } = "edunary_docs";
}
