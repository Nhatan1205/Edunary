using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Edunary.Application.DirectMessages.EventHandlers;

public class MessageCreatedEventHandler : INotificationHandler<MessageCreatedEvent>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly INotifyService _notifyService;
    private readonly ILogger<MessageCreatedEventHandler> _logger;

    public MessageCreatedEventHandler(
        IApplicationDbContext context,
        IIdentityService identityService,
        INotifyService notifyService,
        ILogger<MessageCreatedEventHandler> _logger)
    {
        _context = context;
        _identityService = identityService;
        _notifyService = notifyService;
        this._logger = _logger;
    }

    public async Task Handle(MessageCreatedEvent notification, CancellationToken cancellationToken)
    {
        var message = notification.Message;
        _logger.LogInformation("Handling MessageCreatedEvent for message {MessageId}", message.Id);

        try
        {
            var conversation = await _context.Conversations
                .FirstOrDefaultAsync(c => c.Id == message.ConversationId, cancellationToken);

            if (conversation == null)
            {
                _logger.LogWarning("Conversation {ConversationId} not found for message {MessageId}", message.ConversationId, message.Id);
                return;
            }

            var recipientId = conversation.ParticipantOneId == message.SenderId
                ? conversation.ParticipantTwoId
                : conversation.ParticipantOneId;

            // Simple 1-hour rate limit check:
            // Find the previous message sent in this conversation before the current message
            var previousMessage = await _context.Messages
                .Where(m => m.ConversationId == message.ConversationId && m.Id != message.Id)
                .OrderByDescending(m => m.Created)
                .FirstOrDefaultAsync(cancellationToken);

            if (previousMessage != null)
            {
                var timeSincePrevious = DateTimeOffset.UtcNow - previousMessage.Created;
                if (timeSincePrevious.TotalHours < 1)
                {
                    _logger.LogInformation(
                        "Skipping notification for recipient {RecipientId} in conversation {ConversationId}. Last message was sent {Minutes} minutes ago.",
                        recipientId, conversation.Id, timeSincePrevious.TotalMinutes);
                    return;
                }
            }

            // Fetch sender info for notification content
            var senderUser = await _identityService.GetUserIdentityByIdAsync(message.SenderId);
            var senderName = senderUser?.FullName ?? "Unknown";
            var senderAvatar = senderUser?.Avatar;

            // Send in-app notification regardless of online status
            await _notifyService.NotifyUserAsync(
                recipientId,
                "New Message",
                $"{senderName} sent you a message.",
                "direct_message",
                new { conversationId = conversation.Id },
                cancellationToken,
                url: "/messages",
                imageUrl: senderAvatar ?? "");

            _logger.LogInformation("Successfully sent message notification to recipient {RecipientId} for conversation {ConversationId}.", recipientId, conversation.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling MessageCreatedEvent for message {MessageId}", message.Id);
        }
    }
}
