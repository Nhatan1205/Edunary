using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Edunary.Infrastructure.Hubs;

[Authorize]
public class AppHub : Hub
{
    // Intentionally empty.
    // All logic lives in feature services.
    // All messages broadcast via IAppHubService → Clients.All.SendAsync.
}
