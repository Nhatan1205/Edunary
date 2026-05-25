using System.Text.Json.Serialization;

namespace Edunary.Application.Courses.Queries.GetPublicCourseByIdQuery;
public class CourseContentDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;
    [JsonPropertyName("totalVideoDuration")]
    public string TotalVideoDuration { get; set; } = "0 minutes";
    [JsonPropertyName("contents")]
    public List<SectionDto> Contents { get; set; } = new List<SectionDto>();
}

public class SectionDto
{
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;
    [JsonPropertyName("items")]
    public List<ItemDto> Items { get; set; } = new List<ItemDto>();
}

public class ItemDto
{
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;
    [JsonPropertyName("contentType")]
    public string ContentType { get; set; } = string.Empty;
    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;
    [JsonPropertyName("videoDuration")]
    public string VideoDuration { get; set; } = string.Empty;
    [JsonPropertyName("content")]
    public string Content { get; set; } = string.Empty;
    [JsonPropertyName("isFreePreview")]
    public bool IsFreePreview { get; set; } = false;
    [JsonPropertyName("videoId")]
    public int VideoId { get; set; } = 0;
}

