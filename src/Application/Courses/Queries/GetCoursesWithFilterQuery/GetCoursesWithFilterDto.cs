using System.Text.Json.Serialization;
using Edunary.Domain.Enums;

namespace Edunary.Application.Courses.Queries.GetCoursesWithFilterQuery;
public class GetCoursesWithFilterDto
{
    [JsonPropertyName("Id")]
    public int Id { get; set; }

    [JsonPropertyName("Title")]
    public string Title { get; set; }

    [JsonPropertyName("Subtitle")]
    public string Subtitle { get; set; }

    [JsonPropertyName("Topic")]
    public string Topic { get; set; }

    [JsonPropertyName("Price")]
    public float Price { get; set; }

    [JsonPropertyName("Level")]
    public CourseLevel Level { get; set; }
    [JsonPropertyName("Status")]
    public CourseStatus Status { get; set; }

    [JsonPropertyName("LearningObjectives")]
    public string LearningObjectives { get; set; }

    [JsonPropertyName("Ratings")]
    public float Ratings { get; set; } 

    [JsonPropertyName("TotalStudents")]
    public int TotalStudents { get; set; }

    [JsonPropertyName("CategoryId")]
    public int CategoryId { get; set; }

    [JsonPropertyName("ImageUrl")]
    public string ImageUrl { get; set; }


}
