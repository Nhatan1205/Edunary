
namespace Edunary.Domain.Events.Courses;
public class CourseCreatedEvent : BaseEvent
{
    public CourseCreatedEvent(Course item)
    {
        Item = item;
    }
    public Course Item { get; }
}
