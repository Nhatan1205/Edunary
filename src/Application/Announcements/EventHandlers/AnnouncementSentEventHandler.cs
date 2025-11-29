using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Events.Announcements;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Announcements.EventHandlers;
public class AnnouncementSentEventHandler : INotificationHandler<AnnouncementSentEvent>
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IIdentityService _identityService;
    private readonly INotifyService _notifyService;
    private readonly ICurrentUserService _currentUserService;

    public AnnouncementSentEventHandler(
        IApplicationDbContext context,
        IEmailService emailService,
        IIdentityService identityService,
        INotifyService notifyService,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _emailService = emailService;
        _identityService = identityService;
        _notifyService = notifyService;
        _currentUserService = currentUserService;
    }

    public async Task Handle(AnnouncementSentEvent notification, CancellationToken cancellationToken)
    {
        var announcement = notification.Item;

        // 1. Get all course ids from announcement
        var courseIds = announcement.Courses.Select(c => c.Id).ToList();

        // 2. Get all student ids enrolled in these courses
        var studentIds = await _context.Enrollments
            .Where(e => courseIds.Contains(e.CourseId))
            .Select(e => e.StudentId)
            .Distinct()
            .ToListAsync(cancellationToken);

        // 3. Get emails of these students
        var emails = new List<string>();

        foreach (var id in studentIds)
        {
            var email = (await _identityService.GetUserById(id))?.Email;
            if (!string.IsNullOrWhiteSpace(email))
                emails.Add(email);
        }

        emails = emails.Distinct().ToList();

        // 4. Send emails
        if (emails.Any())
        {
            var html = EmailTemplates.BuildAnnouncementTemplate(announcement.Subject, announcement.Content);
            await _emailService.SendBulkEmailsAsync(emails, announcement.Subject, html);
        }

        // 5. Notify courses about the update
        var userName = _currentUserService?.FullName;
        var avatarUrl = _currentUserService?.Avatar;
        foreach (var courseId in courseIds)
        {
            var notificationRequest = new NotificationRequest
            {
                ImageUrl = avatarUrl,
                CourseId = courseId,
                Title = $"{userName} has made an announcement: {announcement.Subject}",
                Subject = announcement.Subject,
                Message = announcement.Content,
                Type = "announcement",
                Url = ""
            };
            await _notifyService.NotifyCourseUpdated(notificationRequest, cancellationToken);
        }
    }
}
