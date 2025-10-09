using Edunary.Application.Common.Interfaces;
using Edunary.Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Edunary.Infrastructure.Identity;
public class NotifyService : INotifyService
{
    private readonly IHubContext<SignalRServiceHub> _hub;

    public NotifyService(IHubContext<SignalRServiceHub> hub)
    {
        _hub = hub;
    }

    public async Task SendMessage(string sender, string message, string method = "ReceiveMessage")
    {
        await _hub.Clients.All.SendAsync(method, sender, message);
    }
}

