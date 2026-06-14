using Edunary.Domain.Common;
using Edunary.Domain.Entities;

namespace Edunary.Domain.Events.Courses;

public class CourseSubmittedEvent : BaseEvent
{
    public CourseSubmittedEvent(Course item)
    {
        Item = item;
    }

    public Course Item { get; }
}
