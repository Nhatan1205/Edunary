using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Enrollments.Queries.GetStudentsByCourseIdQuery;
using Edunary.Application.Notifications.Commands.CreateNotificationCommand;
using Edunary.Application.NotificationUsers.Commands.CreateNotificationUserCommand;
using MediatR;

namespace Edunary.Infrastructure.Services;

public class NotifyService : INotifyService
{
    private readonly IAppHubService _hub;
    private readonly ISender _sender;
    private readonly ICurrentUserService _currentUserService;

    public NotifyService(
        ISender sender,
        IAppHubService hub,
        ICurrentUserService currentUserService)
    {
        _sender = sender;
        _hub = hub;
        _currentUserService = currentUserService;
    }

    public async Task NotifyCourseUpdated(NotificationRequest request, CancellationToken cancellationToken)
    {
        var students = await _sender.Send(new GetStudentsByCourseIdQuery { CourseId = request.CourseId }, cancellationToken);
        if (!students.Any())
        {
            return;
        }

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

            await _hub.SendAsync($"Notification.New:{student.Id}", new { });
        }
    }

    public async Task NotifyUserAsync(string userId, string title, string message, string type, object payload, CancellationToken cancellationToken = default, int courseId = 0, string url = "", string imageUrl = "")
    {
        try
        {
            var createCommand = new CreateNotificationCommand
            {
                ImageUrl = imageUrl,
                CourseId = courseId,
                Title = title,
                Subject = string.Empty,
                Message = message,
                Type = type,
                Url = url
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

            await _hub.SendAsync($"Notification.New:{userId}", new { });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending notification: {ex.Message}");
        }
    }

}
