using Microsoft.AspNetCore.SignalR;

namespace Edunary.Infrastructure.Hubs;
public class SignalRServiceHub : Hub
{
    public async Task SendMessage(string user, string message)
        => await Clients.All.SendAsync("ReceiveMessage", user, message);
}
