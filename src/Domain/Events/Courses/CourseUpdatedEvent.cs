namespace Edunary.Domain.Events.Courses;
public class CourseUpdatedEvent : BaseEvent
{
    public CourseUpdatedEvent(Course item)
    {
        Item = item;
    }
    public Course Item { get; }
}
