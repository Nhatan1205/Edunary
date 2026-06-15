namespace Edunary.Application.CourseAssistant.Queries.GetCourseAssistantHistoryQuery;

public class CourseAssistantHistoryDto
{
    public List<CourseAssistantMessageDto> Items { get; set; } = new();
    public bool HasMore { get; set; }
}

public class CourseAssistantMessageDto
{
    public string Id { get; set; } = "";
    public string Role { get; set; } = "";
    public string Content { get; set; } = "";
    public string ContentId { get; set; }
    public string ContentType { get; set; }
    public List<string> Sources { get; set; }
    public string CreatedAt { get; set; } = "";
}
