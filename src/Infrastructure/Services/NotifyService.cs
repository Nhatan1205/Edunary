using Edunary.Application.Common.Interfaces;
using Edunary.Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Edunary.Infrastructure.Services;
public class NotifyService : INotifyService
{
    private readonly IHubContext<NotificationHub> _hub;

    public NotifyService(IHubContext<NotificationHub> hub)
    {
        _hub = hub;
    }

    public async Task SendMessage(string sender, string message, string method = "ReceiveMessage")
    {
        await _hub.Clients.All.SendAsync(method, sender, message);
    }
    public async Task SendToGroupAsync(string groupName, string method, object payload)
    {
        await _hub.Clients.Group(groupName).SendAsync(method, payload);
    }

    public async Task SendToUserAsync(string userId, string method, object payload)
    {
        await _hub.Clients.User(userId).SendAsync(method, payload);
    }
}

