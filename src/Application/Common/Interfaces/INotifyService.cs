using Edunary.Application.Common.Models;

namespace Edunary.Application.Common.Interfaces;
public interface INotifyService
{
    Task NotifyCourseUpdated(NotificationRequest request, CancellationToken cancellationToken);
    Task NotifyUserAsync(string userId, string title, string message, string type, object payload, CancellationToken cancellationToken = default);
    
    Task JoinGroupCourse(int courseId);
    Task SendMessage(string sender, string message, string method = "ReceiveMessage");
    Task SendToGroup(string groupName, string method, object payload);
    Task SendToUser(string userId, string method, object payload);
    Task JoinRoom(string roomName, string connectionId);
}
