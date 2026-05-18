using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Common;
using Edunary.Domain.Events.AssignmentSubmissions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.AssignmentSubmissions.EventHandlers;

public class AssignmentFeedbackCreatedEventHandler : INotificationHandler<AssignmentFeedbackCreatedEvent>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly INotifyService _notifyService;

    public AssignmentFeedbackCreatedEventHandler(
        IApplicationDbContext context,
        IIdentityService identityService,
        INotifyService notifyService)
    {
        _context = context;
        _identityService = identityService;
        _notifyService = notifyService;
    }

    public async Task Handle(AssignmentFeedbackCreatedEvent notification, CancellationToken cancellationToken)
    {
        var feedback = notification.Feedback;
        var submission = notification.Submission;

        // 1. Load assignment + course (already included on submission, but re-query if nav props are null)
        var assignment = await _context.Assignments
            .Include(a => a.Course)
            .FirstOrDefaultAsync(a => a.Id == submission.AssignmentId, cancellationToken);

        if (assignment == null)
        {
            return;
        }

        string studentId = submission.StudentId;
        string instructorId = assignment.Course.CreatedBy;
        string courseName = assignment.Course.Title;

        // 2. Resolve instructor info
        var instructor = await _identityService.GetUserById(instructorId);
        string instructorAvatar = instructor?.Avatar ?? string.Empty;
        string instructorName = instructor?.FullName ?? "Your instructor";

        // 3. Send in-app notification to student
        await _notifyService.NotifyUserAsync(
            studentId,
            $"{instructorName} feedback on your assignment in course: \"{courseName}\"",
            $"Open your assignment to view the feedback.",
            "assignment_feedback",
            new { assignmentId = assignment.Id, submissionId = submission.Id },
            cancellationToken,
            assignment.CourseId,
            $"/course/{assignment.CourseId}/learn/assignment/{assignment.ItemId}",
            instructorAvatar);
    }
}
