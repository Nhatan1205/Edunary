using System.Text.Json.Serialization;

namespace Edunary.Application.CourseProgresses.Commands.UpdateCourseProgressCommand;

public class CourseContentSchema
{
    [JsonPropertyName("id")]
    public string Id { get; set; }
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;
    [JsonPropertyName("contents")]
    public List<SectionSchema> Contents { get; set; } = new List<SectionSchema>();
    [JsonPropertyName("nextSectionId")]
    public int NextSectionId { get; set; }
    [JsonPropertyName("nextItemId")]
    public int NextItemId { get; set; }
    [JsonPropertyName("videoContentIds")]
    public List<int> VideoContentIds { get; set; } = new List<int>();
    [JsonPropertyName("totalVideo")]
    public int TotalVideo { get; set; }
    [JsonPropertyName("totalVideoDuration")]
    public string TotalVideoDuration { get; set; } = "0 minutes";
    [JsonPropertyName("lastAccessedItemId")]
    public string LastAccessedItemId { get; set; } = string.Empty;
}

public class SectionSchema
{
    [JsonPropertyName("sectionId")]
    public string SectionId { get; set; }
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;
    [JsonPropertyName("learningObjectives")]
    public string LearningObjectives { get; set; } = string.Empty;
    [JsonPropertyName("items")]
    public List<ItemSchema> Items { get; set; } = new List<ItemSchema>();
    [JsonPropertyName("isEditMode")]
    public bool IsEditMode { get; set; } = false;
    [JsonPropertyName("published")]
    public bool Published { get; set; } = false;
}

public class ItemSchema
{
    [JsonPropertyName("itemId")]
    public string ItemId { get; set; }
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;
    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;
    [JsonPropertyName("content")]
    public string Content { get; set; } = string.Empty;
    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;
    [JsonPropertyName("isPendingType")]
    public bool IsPendingType { get; set; } = false;
    [JsonPropertyName("downloadable")]
    public bool Downloadable { get; set; } = false;
    [JsonPropertyName("resources")]
    public List<ResourseSchema> Resources { get; set; } = new List<ResourseSchema>();
    [JsonPropertyName("contentType")]
    public string ContentType { get; set; } = string.Empty;
    [JsonPropertyName("videoId")]
    public int VideoId { get; set; }
    [JsonPropertyName("videoDuration")]
    public string VideoDuration { get; set; } = "1 minute";
    [JsonPropertyName("isCompleted")]
    public bool IsCompleted { get; set; } = false;
    [JsonPropertyName("lastPosition")]
    public double LastPosition { get; set; } = 0;
    [JsonPropertyName("thumbnailUrl")]
    public string ThumbnailUrl { get; set; } = String.Empty;
}

public class ResourseSchema
{
    [JsonPropertyName("id")]
    public int Id { get; set; }
    [JsonPropertyName("fileName")]
    public string FileName { get; set; } = string.Empty;
    [JsonPropertyName("fileUrl")]
    public string FileUrl { get; set; } = string.Empty;
}