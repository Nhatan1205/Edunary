namespace Edunary.Application.CourseAssistant.Commands.SendCourseAssistantMessageCommand;

public class CourseAssistantReplyDto
{
    public string Reply { get; set; } = "";
    public string MessageType { get; set; } = "text";
    public List<string> Sources { get; set; } = new();
}
