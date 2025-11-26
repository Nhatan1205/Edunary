using Edunary.Domain.Events.Announcements;

namespace Edunary.Domain.Entities;
public class Announcement : BaseAuditableEntity
{
    public string Subject { get; set; }
    public string Content { get; set; }
    public AnnouncementStatus Status { get; set; }
    public DateTime? SentAt { get; set; }

    // Navigation properties
    public ICollection<Course> Courses { get; set; } = new List<Course>();
    public IList<AnnouncementRecipient> Recipients { get; set; } = new List<AnnouncementRecipient>();


}
