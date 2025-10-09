namespace Edunary.Application.Common.Interfaces;
public interface INotifyService
{
    Task SendMessage(string sender, string message, string method = "ReceiveMessage");
}
