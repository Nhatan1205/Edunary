namespace Edunary.Domain.Events.CourseAnswers;
public class CourseAnswerCreatedEvent : BaseEvent
{
    public CourseAnswerCreatedEvent(CourseAnswer item)
    {
        Item = item;
    }
    public CourseAnswer Item { get; }
}
