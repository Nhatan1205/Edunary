namespace Edunary.Domain.Entities;
public class NotificationUser : BaseAuditableEntity
{
    public int NotificationId { get; set; }
    public string StudentId { get; set; }
    public bool IsRead { get; set; }
    public Notification Notification { get; set; }
}
