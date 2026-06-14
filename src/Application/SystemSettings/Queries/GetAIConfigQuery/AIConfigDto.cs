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

    public string LLMValidatorModelName { get; set; } = "";
    public string LLMValidatorApiKey { get; set; } = "";
    public string LLMValidatorBaseUrl { get; set; } = "";
    public double LLMValidatorTemperature { get; set; } = 0.3;
    public int LLMValidatorMaxTokens { get; set; } = 4096;

    // Embedding
    public string EmbeddingProvider { get; set; } = "";
    public string EmbeddingModelName { get; set; } = "";
    public string EmbeddingApiKey { get; set; } = "";
    public string EmbeddingBaseUrl { get; set; } = "";

    // Qdrant
    public string QdrantUrl { get; set; } = "";
    public string QdrantApiKey { get; set; } = "";
    public string QdrantCollection { get; set; } = "edunary_docs";

    // STT (Speech-to-Text)
    public string STTApiKey { get; set; } = "";
    public string STTModelName { get; set; } = "whisper-1";
}
