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
    [JsonPropertyName("isFreePreview")]
    public bool IsFreePreview { get; set; } = false;
    [JsonPropertyName("isCompleted")]
    public bool IsCompleted { get; set; } = false;
    [JsonPropertyName("lastPosition")]
    public double LastPosition { get; set; } = 0;
    [JsonPropertyName("thumbnailUrl")]
    public string ThumbnailUrl { get; set; } = String.Empty;
    /// <summary>Reference to Quiz.Id in the Quizzes table. 0 = not a quiz item.</summary>
    [JsonPropertyName("quizId")]
    public int QuizId { get; set; } = 0;
    /// <summary>Reference to Assignment.Id in the Assignments table. 0 = not an assignment item.</summary>
    [JsonPropertyName("assignmentId")]
    public int AssignmentId { get; set; } = 0;
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