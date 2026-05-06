using Edunary.Application.Common.Interfaces;
using Edunary.Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Edunary.Infrastructure.Services;

public class AppHubService : IAppHubService
{
    private readonly IHubContext<AppHub> _hubContext;
    private readonly ILogger<AppHubService> _logger;

    public AppHubService(IHubContext<AppHub> hubContext, ILogger<AppHubService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task SendAsync<T>(string eventName, T data)
    {
        try
        {
            await _hubContext.Clients.All.SendAsync(eventName, data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SignalR broadcast failed for event: {Event}", eventName);
        }
    }
}
