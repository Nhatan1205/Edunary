using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.DirectMessages.Queries;
using Edunary.Domain.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Edunary.Application.DirectMessages.EventHandlers;

public class SendMessageEventHandler : INotificationHandler<MessageCreatedEvent>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly IMessagingHubService _messagingHubService;
    private readonly IConnectionManagerService _connectionManager;
    private readonly INotifyService _notifyService;
    private readonly IMapper _mapper;
    private readonly ILogger<SendMessageEventHandler> _logger;

    public SendMessageEventHandler(
        IApplicationDbContext context,
        IIdentityService identityService,
        IMessagingHubService messagingHubService,
        IConnectionManagerService connectionManager,
        INotifyService notifyService,
        IMapper mapper,
        ILogger<SendMessageEventHandler> logger)
    {
        _context = context;
        _identityService = identityService;
        _messagingHubService = messagingHubService;
        _connectionManager = connectionManager;
        _notifyService = notifyService;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task Handle(MessageCreatedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Edunary Domain Event Handled: {DomainEvent}", notification.GetType().Name);

        try
        {
            var message = notification.Message;
            
            // Retrieve conversation to find participant IDs
            var conversation = await _context.Conversations
                .FirstOrDefaultAsync(c => c.Id == message.ConversationId, cancellationToken);

            if (conversation == null)
            {
                _logger.LogWarning("Conversation {ConversationId} not found for message {MessageId}.", message.ConversationId, message.Id);
                return;
            }

            var recipientId = conversation.ParticipantOneId == message.SenderId
                ? conversation.ParticipantTwoId
                : conversation.ParticipantOneId;

            // Retrieve sender profile info
            var senderUser = await _identityService.GetUserIdentityByIdAsync(message.SenderId);
            var senderName = senderUser?.FullName ?? "Unknown";
            var senderAvatar = senderUser?.Avatar;

            // Map message to DTO and populate sender fields
            var messageDto = _mapper.Map<MessageDto>(message);
            messageDto.SenderName = senderName;
            messageDto.SenderAvatar = senderAvatar;

            // Broadcast message DTO via websocket
            await _messagingHubService.SendMessageToGroupAsync(
                conversation.Id,
                "ReceiveMessage",
                messageDto);

            // Send in-app notification only if the recipient is offline
            var recipientOnline = await _connectionManager.IsConnectedAsync(recipientId);
            if (!recipientOnline)
            {
                await _notifyService.NotifyUserAsync(
                    recipientId,
                    "New Message",
                    $"{senderName} sent you a message.",
                    "direct_message",
                    new { conversationId = conversation.Id },
                    cancellationToken,
                    url: "/messages",
                    imageUrl: senderAvatar ?? ""
                );
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while handling MessageCreatedEvent for message {MessageId}.", notification.Message.Id);
        }
    }
}
