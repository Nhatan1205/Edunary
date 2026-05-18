using Edunary.Domain.Entities;

namespace Edunary.Domain.Events.AssignmentSubmissions;

public class AssignmentFeedbackCreatedEvent : BaseEvent
{
    public AssignmentFeedbackCreatedEvent(AssignmentFeedback feedback, AssignmentSubmission submission)
    {
        Feedback = feedback;
        Submission = submission;
    }

    public AssignmentFeedback Feedback { get; }
    public AssignmentSubmission Submission { get; }
}
