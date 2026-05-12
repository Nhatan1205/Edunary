using Edunary.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Edunary.Infrastructure.Hubs;

[Authorize]
public class AppHub : Hub
{
    private readonly IConnectionManagerService _connectionManager;

    public AppHub(IConnectionManagerService connectionManager)
    {
        _connectionManager = connectionManager;
    }

    public override async Task OnConnectedAsync()
    {
        string userId = Context.UserIdentifier;
        if (!string.IsNullOrWhiteSpace(userId))
        {
            await _connectionManager.AddConnectionAsync(userId, Context.ConnectionId);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception exception)
    {
        await _connectionManager.RemoveConnectionAsync(Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
}
