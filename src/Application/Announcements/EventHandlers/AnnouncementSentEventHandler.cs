using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Common;
using Edunary.Domain.Enums;
using Edunary.Domain.Events.Announcements;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Edunary.Application.Announcements.EventHandlers;
public class AnnouncementSentEventHandler : INotificationHandler<AnnouncementSentEvent>
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IIdentityService _identityService;
    private readonly INotifyService _notifyService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IActivityLogService _activityLogService;
    private readonly AppSettings _appSettings;

    public AnnouncementSentEventHandler(
        IApplicationDbContext context,
        IEmailService emailService,
        IIdentityService identityService,
        INotifyService notifyService,
        ICurrentUserService currentUserService,
        IActivityLogService activityLogService,
        IOptions<AppSettings> appSettings)
    {
        _context = context;
        _emailService = emailService;
        _identityService = identityService;
        _notifyService = notifyService;
        _currentUserService = currentUserService;
        _activityLogService = activityLogService;
        _appSettings = appSettings.Value;
    }

    public async Task Handle(AnnouncementSentEvent notification, CancellationToken cancellationToken)
    {
        var announcement = notification.Item;

        // 1. Get all course ids from announcement
        var courseIds = announcement.Courses.Select(c => c.Id).ToList();

        // 2. Get instructor info
        var instructorName = _currentUserService?.FullName ?? "Instructor";
        var instructorAvatar = _currentUserService?.Avatar ?? string.Empty;

        // 3. Get all student enrollments per course
        var enrollments = await _context.Enrollments
            .Where(e => courseIds.Contains(e.CourseId))
            .Select(e => new { e.StudentId, e.CourseId })
            .ToListAsync(cancellationToken);

        // 4. Send email per student per course
        foreach (var courseId in courseIds)
        {
            var course = announcement.Courses.FirstOrDefault(c => c.Id == courseId);
            var courseName = course?.Title ?? string.Empty;
            var courseUrl = $"{_appSettings.ClientUrl}/course/{courseId}/learn/lecture/item-1?tab=announcements";
            var actionUrl = $"{_appSettings.ClientUrl}/course/{courseId}/learn/lecture/item-1?tab=announcements";

            var studentIdsInCourse = enrollments
                .Where(e => e.CourseId == courseId)
                .Select(e => e.StudentId)
                .Distinct()
                .ToList();

            foreach (var studentId in studentIdsInCourse)
            {
                var student = await _identityService.GetUserById(studentId);
                if (student == null || string.IsNullOrWhiteSpace(student.Email))
                {
                    continue;
                }

                var studentName = student.FullName ?? "Student";
                var html = EmailTemplates.BuildAnnouncementTemplate(
                    studentName,
                    instructorName,
                    instructorAvatar,
                    courseName,
                    courseUrl,
                    announcement.Subject,
                    announcement.Content,
                    actionUrl);

                await _emailService.SendBulkEmailsAsync(
                    new[] { student.Email }, 
                    announcement.Subject, 
                    html, 
                    $"Edunary Instructor: {instructorName}"
                );
            }

            // 5. Notify course students via SignalR
            var notificationRequest = new NotificationRequest
            {
                ImageUrl = instructorAvatar,
                CourseId = courseId,
                Title = $"{instructorName} has made an announcement: {announcement.Subject}",
                Subject = announcement.Subject,
                Message = announcement.Content,
                Type = "announcement",
                Url = $"/course/{courseId}/learn/lecture/item-1?tab=announcements"
            };
            await _notifyService.NotifyCourseUpdated(notificationRequest, cancellationToken);
        }

        _activityLogService.EnqueueLog(new ActivityLogEntry
        {
            UserId = _currentUserService.UserId,
            ActivityType = ActivityType.SendAnnouncement,
            Description = $"Sent announcement to students in course"
        });
    }
}
