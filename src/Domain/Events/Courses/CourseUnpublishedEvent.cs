using Edunary.Domain.Common;
using Edunary.Domain.Entities;

namespace Edunary.Domain.Events.Courses;

public class CourseUnpublishedEvent : BaseEvent
{
    public CourseUnpublishedEvent(Course item, string reason)
    {
        Item = item;
        Reason = reason;
    }

    public Course Item { get; }
    public string Reason { get; }
}
