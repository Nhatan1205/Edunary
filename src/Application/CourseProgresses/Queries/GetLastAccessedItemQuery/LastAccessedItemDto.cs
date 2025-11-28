using System.Text.Json.Serialization;

namespace Edunary.Application.CourseProgresses.Queries.GetLastAccessedItemQuery;

public class LastAccessedItemDto
{
    [JsonPropertyName("itemId")]
    public string ItemId { get; set; }

    [JsonPropertyName("routeType")]
    public string RouteType { get; set; }
}
