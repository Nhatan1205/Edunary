namespace Edunary.Application.Common.Interfaces;
public interface INotifyService
{
    Task SendMessage(string sender, string message, string method = "ReceiveMessage");
    Task SendToGroupAsync(string groupName, string method, object payload);
    Task SendToUserAsync(string userId, string method, object payload);
}
