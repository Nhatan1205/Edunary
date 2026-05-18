using Edunary.Domain.Entities;

namespace Edunary.Domain.Events.AssignmentSubmissions;

public class AssignmentSubmittedEvent : BaseEvent
{
    public AssignmentSubmittedEvent(AssignmentSubmission submission)
    {
        Submission = submission;
    }

    public AssignmentSubmission Submission { get; }
}
