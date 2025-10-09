using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Infrastructure.Services;
public class NotificationCourseService : INotificationCourseService
{
    private readonly IApplicationDbContext _context;
    private readonly INotifyService _notifyService;

    public NotificationCourseService(
        IApplicationDbContext context,
        INotifyService notifyService)
    {
        _context = context;
        _notifyService = notifyService;
    }

    public async Task NotifyCourseUpdatedAsync(int courseId, string title, string message, CancellationToken cancellationToken)
    {
        var notification = new Notification
        {
            Title = title,
            Message = message,
            Type = "course_update",
            CourseId = courseId,
            Url = $"/courses/{courseId}"
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync(cancellationToken);

        // get all studnet in the course
        var studentIds = await _context.Enrollments
            .Where(e => e.CourseId == courseId)
            .Select(e => e.StudentId)
            .ToListAsync(cancellationToken);

        // mapping NotificationUser
        var mappings = studentIds.Select(sid => new NotificationUser
        {
            NotificationId = notification.Id,
            StudentId = sid,
            IsRead = false
        }).ToList();

        _context.NotificationUsers.AddRange(mappings);
        await _context.SaveChangesAsync(cancellationToken);

        var payload = new
        {
            Title = notification.Title,
            Message = notification.Message,
            CourseId = courseId,
            Created = DateTime.UtcNow
        };

        await _notifyService.SendToGroupAsync($"{courseId}", "ReceiveMessage", payload);
    }
}
