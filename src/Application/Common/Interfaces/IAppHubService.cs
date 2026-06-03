namespace Edunary.Application.Common.Interfaces;

public interface IAppHubService
{
    Task SendAsync<T>(string eventName, T data);
    Task SendToGroupAsync<T>(string groupName, string eventName, T data);
}
