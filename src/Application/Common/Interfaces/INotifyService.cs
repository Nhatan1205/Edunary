namespace Edunary.Application.Common.Interfaces;
public interface INotifyService
{
    Task NotifyCourseUpdated(int courseId, string title, string message,string type, CancellationToken cancellationToken);
    
    Task JoinGroupCourse(int courseId);
    Task SendMessage(string sender, string message, string method = "ReceiveMessage");
    Task SendToGroup(string groupName, string method, object payload);
    Task SendToUser(string userId, string method, object payload);
    Task JoinRoom(string roomName, string connectionId);
}
