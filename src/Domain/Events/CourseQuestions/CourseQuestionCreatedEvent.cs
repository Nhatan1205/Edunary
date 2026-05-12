namespace Edunary.Domain.Events.CourseQuestions;
public class CourseQuestionCreatedEvent : BaseEvent
{
    public CourseQuestionCreatedEvent(CourseQuestion item)
    {
        Item = item;
    }
    public CourseQuestion Item { get; }
}
