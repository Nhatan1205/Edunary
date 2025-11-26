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

    public AnnouncementSentEventHandler(
        IApplicationDbContext context,
        IEmailService emailService,
        IIdentityService identityService)
    {
        _context = context;
        _emailService = emailService;
        _identityService = identityService;
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

        // 3. Get user info for these students
        var users = await Task.WhenAll(
            studentIds.Select(id => _identityService.GetUserById(id))
        );

        // 4. Extract emails
        var emails = users
            .Where(u => u != null && !string.IsNullOrWhiteSpace(u.Email))
            .Select(u => u.Email!)
            .Distinct()
            .ToList();

        // 5. Send emails
        if (emails.Any())
        {
            var html = EmailTemplates.BuildAnnouncementTemplate(announcement.Subject, announcement.Content);
            await _emailService.SendBulkEmailsAsync(emails, announcement.Subject, html);
        }
    }
}
