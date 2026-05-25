using Edunary.Domain.Common;
using Edunary.Domain.Entities;

namespace Edunary.Domain.Events.Courses;

public class CourseApprovedEvent : BaseEvent
{
    public CourseApprovedEvent(Course item)
    {
        Item = item;
    }

    public Course Item { get; }
}
