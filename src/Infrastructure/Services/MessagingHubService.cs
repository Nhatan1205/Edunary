using System;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Edunary.Infrastructure.Services;

public class MessagingHubService : IMessagingHubService
{
    private readonly IHubContext<MessagingHub> _hubContext;
    private readonly ILogger<MessagingHubService> _logger;

    public MessagingHubService(IHubContext<MessagingHub> hubContext, ILogger<MessagingHubService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task SendMessageToGroupAsync(int conversationId, string eventName, object messageData)
    {
        try
        {
            await _hubContext.Clients
                .Group($"conversation:{conversationId}")
                .SendAsync(eventName, messageData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SignalR messaging broadcast failed for group conversation:{ConversationId}, event: {Event}", conversationId, eventName);
        }
    }
}
