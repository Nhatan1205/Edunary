using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Edunary.Application.CourseProgresses.Queries.GetCPByItemIdQuery;

public class CourseItemDto
{
    [JsonPropertyName("currentItem")]
    public ItemDetailDto CurrentItem { get; set; }

    [JsonPropertyName("navigation")]
    public NavigationDto Navigation { get; set; }
}
public class ItemDetailDto
{
    [JsonPropertyName("itemId")]
    public string ItemId { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; }

    [JsonPropertyName("description")]
    public string Description { get; set; }

    [JsonPropertyName("content")]
    public string Content { get; set; }

    [JsonPropertyName("contentType")]
    public string ContentType { get; set; } 

    [JsonPropertyName("type")]
    public string Type { get; set; } 

    [JsonPropertyName("lastPosition")]
    public double LastPosition { get; set; }

    [JsonPropertyName("isCompleted")]
    public bool IsCompleted { get; set; }
}

public class NavigationDto
{
    [JsonPropertyName("prev")]
    public NavItemDto Prev { get; set; }

    [JsonPropertyName("next")]
    public NavItemDto Next { get; set; }
}

public class NavItemDto
{
    [JsonPropertyName("itemId")]
    public string ItemId { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; }

    [JsonPropertyName("type")]
    public string Type { get; set; }
}