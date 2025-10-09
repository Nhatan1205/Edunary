namespace Edunary.Domain.Entities;
public class Notification : BaseAuditableEntity
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "course_update";
    public int CourseId { get; set; }
    public string Url { get; set; }
}
