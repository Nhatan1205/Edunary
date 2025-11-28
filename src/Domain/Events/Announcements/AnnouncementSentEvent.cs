namespace Edunary.Domain.Events.Announcements;
public class AnnouncementSentEvent : BaseEvent
{
    public AnnouncementSentEvent(Announcement item)
    {
        Item = item;
    }
    public Announcement Item { get; }
}
