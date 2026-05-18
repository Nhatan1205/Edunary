using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Common;
using Edunary.Domain.Events.AssignmentSubmissions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.AssignmentSubmissions.EventHandlers;

public class AssignmentSubmittedEventHandler : INotificationHandler<AssignmentSubmittedEvent>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly INotifyService _notifyService;

    public AssignmentSubmittedEventHandler(
        IApplicationDbContext context,
        IIdentityService identityService,
        INotifyService notifyService)
    {
        _context = context;
        _identityService = identityService;
        _notifyService = notifyService;
    }

    public async Task Handle(AssignmentSubmittedEvent notification, CancellationToken cancellationToken)
    {
        var submission = notification.Submission;

        // 1. Load assignment + course info
        var assignment = await _context.Assignments
            .Include(a => a.Course)
            .FirstOrDefaultAsync(a => a.Id == submission.AssignmentId, cancellationToken);

        if (assignment == null)
        {
            return;
        }

        string instructorId = assignment.Course.CreatedBy;
        string courseName = assignment.Course.Title;

        // 2. Skip if student IS the instructor (edge case)
        if (submission.StudentId == instructorId)
        {
            return;
        }

        // 3. Cooldown: skip if we already notified this instructor for this course in the last 24 hours
        var cutoff = DateTimeOffset.UtcNow.AddHours(-24);
        bool alreadyNotified = await _context.NotificationUsers
            .Include(nu => nu.Notification)
            .AnyAsync(
                nu => nu.StudentId == instructorId
                    && nu.Notification.Type == "assignment_submission"
                    && nu.Notification.CourseId == assignment.CourseId
                    && nu.Notification.Created >= cutoff,
                cancellationToken);

        if (alreadyNotified)
        {
            return;
        }

        // 4. Resolve student info
        var student = await _identityService.GetUserById(submission.StudentId);
        string studentAvatar = student?.Avatar ?? string.Empty;
        string studentName = student?.FullName ?? "A student";

        // 5. Send notification to instructor
        await _notifyService.NotifyUserAsync(
            instructorId,
            $"You have new submission(s) in course: \"{courseName}\"",
            $"{studentName} submitted an assignment.",
            "assignment_submission",
            new { assignmentId = assignment.Id, submissionId = submission.Id },
            cancellationToken,
            assignment.CourseId,
            "/instructor/communication/assignments",
            studentAvatar);
    }
}
