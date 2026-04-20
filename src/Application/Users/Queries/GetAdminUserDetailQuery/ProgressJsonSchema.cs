using System.Text.Json.Serialization;

namespace Edunary.Application.Users.Queries.GetAdminUserDetailQuery;

public class ProgressJsonSchema
{
    [JsonPropertyName("contents")]
    public List<ProgressSectionSchema> Contents { get; set; } = new();
}

public class ProgressSectionSchema
{
    [JsonPropertyName("items")]
    public List<ProgressItemSchema> Items { get; set; } = new();
}

public class ProgressItemSchema
{
    [JsonPropertyName("isCompleted")]
    public bool IsCompleted { get; set; }
}
