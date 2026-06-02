using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.DirectMessages.Queries.GetConversationMessagesQuery;
using Edunary.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Edunary.Application.DirectMessages.Commands.SendMessageCommand;

public class SendMessageCommand : IRequest<Result>
{
    public int ConversationId { get; init; }
    public string Content { get; init; }
}

public class SendMessageCommandHandler : IRequestHandler<SendMessageCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;
    private readonly IAppHubService _appHubService;
    private readonly INotifyService _notifyService;
    private readonly IMapper _mapper;
    private readonly ILogger<SendMessageCommandHandler> _logger;

    public SendMessageCommandHandler(
        IApplicationDbContext context,
        IUser currentUser,
        IIdentityService identityService,
        IAppHubService appHubService,
        INotifyService notifyService,
        IMapper mapper,
        ILogger<SendMessageCommandHandler> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
        _appHubService = appHubService;
        _notifyService = notifyService;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result> Handle(SendMessageCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var currentUserId = _currentUser.Id;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Result.Failure("User is not authenticated.");
            }

            var conversation = await _context.Conversations
                .FirstOrDefaultAsync(c => c.Id == request.ConversationId, cancellationToken);

            if (conversation == null)
            {
                return Result.Failure("Conversation not found.");
            }

            if (conversation.ParticipantOneId != currentUserId && conversation.ParticipantTwoId != currentUserId)
            {
                return Result.Failure("You are not a participant in this conversation.");
            }

            if (conversation.IsBlocked)
            {
                return Result.Failure("You cannot send messages because the conversation is blocked.");
            }

            var otherParticipantId = conversation.ParticipantOneId == currentUserId
                ? conversation.ParticipantTwoId
                : conversation.ParticipantOneId;

            // Fetch sender
            var senderUser = await _identityService.GetUserIdentityByIdAsync(currentUserId);
            var senderName = senderUser?.FullName ?? "Unknown";
            var senderAvatar = senderUser?.Avatar;

            // Create new Message
            var message = new Message
            {
                ConversationId = conversation.Id,
                SenderId = currentUserId,
                Content = request.Content,
                IsRead = false
            };

            _context.Messages.Add(message);

            // Update Conversation details
            conversation.LastMessage = message;
            conversation.LastMessageAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            await DeliverMessageAndNotifyAsync(
                message,
                conversation,
                otherParticipantId,
                senderName,
                senderAvatar,
                cancellationToken);

            return Result.Success("Message sent successfully.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Error: {ex.Message}");
        }
    }

    private async Task DeliverMessageAndNotifyAsync(
        Message message,
        Conversation conversation,
        string recipientId,
        string senderName,
        string senderAvatar,
        CancellationToken cancellationToken)
    {
        try
        {
            var messageDto = _mapper.Map<MessageDto>(message);
            messageDto.SenderName = senderName;
            messageDto.SenderAvatar = senderAvatar;

            await _appHubService.SendToGroupAsync(
                $"conversation:{conversation.Id}",
                "ReceiveMessage",
                messageDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to broadcast message {MessageId} for conversation {ConversationId}.",
                message.Id, conversation.Id);
        }

        try
        {
            // Rate limit: skip notification if a message was sent within the last hour
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
                        "Skipping notification for recipient {RecipientId} — last message was {Minutes:F1} min ago.",
                        recipientId, timeSincePrevious.TotalMinutes);
                    return;
                }
            }

            await _notifyService.NotifyUserAsync(
                recipientId,
                "New Message",
                $"{senderName} sent you a message.",
                "direct_message",
                new { conversationId = conversation.Id },
                cancellationToken,
                url: "/messages",
                imageUrl: senderAvatar ?? "");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to send notification for message {MessageId} to recipient {RecipientId}.",
                message.Id, recipientId);
        }
    }
}
