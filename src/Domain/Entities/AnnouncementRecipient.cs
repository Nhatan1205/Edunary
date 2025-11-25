namespace Edunary.Domain.Entities;
public class AnnouncementRecipient : BaseAuditableEntity
{
    public int StudentId { get; set; }
    public int AnnouncementId { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public Announcement Announcement { get; set; }

    public void MarkAsRead()
    {
        IsRead = true;
        ReadAt = DateTime.UtcNow;
    }
}
