using Edunary.Domain.Common;
using Edunary.Domain.Entities;

namespace Edunary.Domain.Events.CourseReviews;

public class CourseReviewChangesRequestedEvent : BaseEvent
{
    public CourseReviewChangesRequestedEvent(CourseReviewSubmission item, string adminNote)
    {
        Item = item;
        AdminNote = adminNote;
    }

    public CourseReviewSubmission Item { get; }
    public string AdminNote { get; }
}
