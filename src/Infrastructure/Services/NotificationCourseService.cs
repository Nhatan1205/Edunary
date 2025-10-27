using Edunary.Application.Common.Interfaces;
using Edunary.Application.Enrollments.Queries.GetStudentsByCourseIdQuery;
using Edunary.Application.Notifications.Commands.CreateNotificationCommand;
using Edunary.Application.NotificationUsers.Commands.CreateNotificationUserCommand;
using Edunary.Domain.Entities;
using Edunary.Infrastructure.Hubs;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Infrastructure.Services;
public class NotificationCourseService : INotificationCourseService
{
    private readonly ISender _sender;
    private readonly IHubContext<NotificationHub> _hub;
    private readonly ICurrentUserService _currentUserService;
    private readonly IConnectionManagerService _connectionManager;

    public NotificationCourseService(ISender sender, IHubContext<NotificationHub> hub, ICurrentUserService currentUserService, IConnectionManagerService connectionManager)
    {
        _sender = sender;
        _hub = hub;
        _currentUserService = currentUserService;
        _connectionManager = connectionManager;
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

            await _hub.Clients.Group(courseId.ToString()).SendAsync("ReceiveMessage", payload);
        }
    }

    public async Task JoinGroup(int courseId)
    {
        var userId = _currentUserService?.UserId;
        var connections = _connectionManager.GetConnections(userId);
        foreach (var connectionId in connections)
        {
            await _hub.Groups.AddToGroupAsync(connectionId, courseId.ToString());
        }
    }
}
