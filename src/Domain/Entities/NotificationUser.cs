namespace Edunary.Domain.Entities;
public class NotificationUser : BaseAuditableEntity
{
    public int NotificationId { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public Notification Notification { get; set; } = null!;
}
