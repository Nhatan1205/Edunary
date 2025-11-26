using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.Announcements.Commands.SendAnnouncementEmailCommand;
public class SendAnnouncementEmailCommand : IRequest
{
    public Announcement Announcement { get; }
    public SendAnnouncementEmailCommand(Announcement announcement)
    {
        Announcement = announcement;
    }
}

public class SendAnnouncementEmailCommandHandler : IRequestHandler<SendAnnouncementEmailCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IIdentityService _identityService;

    public SendAnnouncementEmailCommandHandler(
        IApplicationDbContext context,
        IEmailService emailService,
        IIdentityService identityService)
    {
        _context = context;
        _emailService = emailService;
        _identityService = identityService;
    }

    public async Task Handle(SendAnnouncementEmailCommand request, CancellationToken cancellationToken)
    {
        var announcement = request.Announcement;
        //1. get all course ids from announcement
        var courseIds = announcement.Courses.Select(c => c.Id).ToList();
        //2. get all student id enrolled in these courses
        var studentIds = await _context.Enrollments
            .Where(e => courseIds.Contains(e.CourseId))
            .Select(e => e.StudentId)
            .Distinct()
            .ToListAsync(cancellationToken);

        //3. get all user info from these student ids
        var users = await Task.WhenAll(
            studentIds.Select(id => _identityService.GetUserById(id))
        );
        //4.get all emails from these users
        var emails = users
            .Where(u => u != null && !string.IsNullOrWhiteSpace(u.Email))
            .Select(u => u.Email!)
            .Distinct()
            .ToList();
        //5.send to these emails
        if (emails.Any())
        {
            var html = EmailTemplates.BuildAnnouncementTemplate(announcement.Subject, announcement.Content);
            await _emailService.SendBulkEmailsAsync(emails, announcement.Subject, html);
        }
    }
}

