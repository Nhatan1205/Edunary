using Edunary.Application.Common.Interfaces;
using Edunary.Application.Enrollments.Queries.GetStudentsByCourseIdQuery;
using Edunary.Application.Notifications.Commands.CreateNotificationCommand;
using Edunary.Application.NotificationUsers.Commands.CreateNotificationUserCommand;
using Edunary.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Infrastructure.Services;
public class NotificationCourseService : INotificationCourseService
{
    private readonly INotifyService _notifyService;
    private readonly ISender _sender;

    public NotificationCourseService(INotifyService notifyService, ISender sender)
    {
        _notifyService = notifyService;
        _sender = sender;
    }

    public async Task NotifyCourseUpdatedAsync(int courseId, string title, string message, CancellationToken cancellationToken)
    {
        // get all studnet in the course
        var students = await _sender.Send(new GetStudentsByCourseIdQuery { CourseId = courseId }, cancellationToken);
        if (students.Any())
        {
            var createCommand = new CreateNotificationCommand
            {
                CourseId = courseId,
                Title = title,
                Message = message,
                Type = "course_update",
                Url = $"/courses/{courseId}"
            };

            var resultNotification = await _sender.Send(createCommand, cancellationToken);

            foreach (var student in students)
            {
                var command = new CreateNotificationUserCommand
                {
                    NotificationId = (int)resultNotification.Data,
                    StudentId = student.Id,
                    IsRead = false
                };
                await _sender.Send(command, cancellationToken);
            }

            var payload = new
            {
                Title = title,
                Message = message,
                CourseId = courseId,
                Created = DateTime.UtcNow
            };

            await _notifyService.SendToGroupAsync($"{courseId}", "ReceiveMessage", payload);
        }
    }
}
