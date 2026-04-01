using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Enrollments.Queries.GetStudentsByCourseIdQuery;
using Edunary.Application.Notifications.Commands.CreateNotificationCommand;
using Edunary.Application.NotificationUsers.Commands.CreateNotificationUserCommand;
using Edunary.Infrastructure.Hubs;
using MediatR;
using Microsoft.AspNetCore.SignalR;

namespace Edunary.Infrastructure.Services;
public class NotifyService : INotifyService
{
    private readonly IHubContext<NotificationHub> _hub;
    private readonly ISender _sender;
    private readonly ICurrentUserService _currentUserService;
    private readonly IConnectionManagerService _connectionManager;

    public NotifyService(ISender sender, IHubContext<NotificationHub> hub, ICurrentUserService currentUserService, IConnectionManagerService connectionManager)
    {
        _sender = sender;
        _hub = hub;
        _currentUserService = currentUserService;
        _connectionManager = connectionManager;
    }
    public async Task NotifyCourseUpdated(NotificationRequest request, CancellationToken cancellationToken)
    {
        // get all studnet in the course
        var students = await _sender.Send(new GetStudentsByCourseIdQuery { CourseId = request.CourseId }, cancellationToken);
        if (students.Any())
        {
            var createCommand = new CreateNotificationCommand
            {
                ImageUrl = request.ImageUrl,
                CourseId = request.CourseId,
                Title = request.Title,
                Subject = request.Subject,
                Message = request.Message,
                Type = request.Type,
                Url = request.Url
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
                CourseId = request.CourseId,
                Title = request.Title,
                Subject = request.Subject,
                Message = request.Message,
                Type = request.Type,
                Url = request.Url
            };

            await _hub.Clients.Group(request.CourseId.ToString()).SendAsync("ReceiveMessage", payload);
        }
    }

    public async Task NotifyUserAsync(string userId, string title, string message, string type, object payload, CancellationToken cancellationToken = default)
    {
        try
        {
            var createCommand = new CreateNotificationCommand
            {
                ImageUrl = string.Empty,
                CourseId = 0,
                Title = title,
                Subject = "",
                Message = message,
                Type = type,
                Url = string.Empty
            };

            var resultNotification = await _sender.Send(createCommand, cancellationToken);
            if (resultNotification.Succeeded && resultNotification.Data != null)
            {
                var command = new CreateNotificationUserCommand
                {
                    NotificationId = (int)resultNotification.Data,
                    StudentId = userId,
                    IsRead = false
                };
                await _sender.Send(command, cancellationToken);
            }

            await _hub.Clients.User(userId).SendAsync("ReceiveMessage", payload, cancellationToken);
        }
        catch (Exception ex)
        {
            // Log if necessary, but don't break main flow flow
            Console.WriteLine($"Error sending notification: {ex.Message}");
        }
    }

    public async Task JoinGroupCourse(int courseId)
    {
        var userId = _currentUserService?.UserId;
        var connections = _connectionManager.GetConnections(userId);
        foreach (var connectionId in connections)
        {
            await JoinRoom(courseId.ToString(), connectionId);
        }
    }

    public async Task SendMessage(string sender, string message, string method = "ReceiveMessage")
    {
        await _hub.Clients.All.SendAsync(method, sender, message);
    }
    public async Task SendToUser(string userId, string method, object payload)
    {
        await _hub.Clients.User(userId).SendAsync(method, payload);
    }
    public async Task SendToGroup(string groupName, string method, object payload)
    {
        await _hub.Clients.Group(groupName).SendAsync(method, payload);
    }
    public async Task JoinRoom(string roomName, string connectionId)
    {
        await _hub.Groups.AddToGroupAsync(connectionId, roomName);
    }

}
