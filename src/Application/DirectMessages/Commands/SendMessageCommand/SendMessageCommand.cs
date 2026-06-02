using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.DirectMessages.Queries.GetConversationMessagesQuery;
using Edunary.Domain.Entities;
using Edunary.Domain.Events;
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
    private readonly IMapper _mapper;
    private readonly ILogger<SendMessageCommandHandler> _logger;

    public SendMessageCommandHandler(
        IApplicationDbContext context,
        IUser currentUser,
        IIdentityService identityService,
        IAppHubService appHubService,
        IMapper mapper,
        ILogger<SendMessageCommandHandler> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
        _appHubService = appHubService;
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

            // Verify current user is part of the conversation
            if (conversation.ParticipantOneId != currentUserId && conversation.ParticipantTwoId != currentUserId)
            {
                return Result.Failure("You are not a participant in this conversation.");
            }

            var otherParticipantId = conversation.ParticipantOneId == currentUserId
                ? conversation.ParticipantTwoId
                : conversation.ParticipantOneId;

            if (conversation.IsBlocked)
            {
                return Result.Failure("You cannot send messages because the conversation is blocked.");
            }

            // Create new Message
            var message = new Message
            {
                ConversationId = conversation.Id,
                SenderId = currentUserId,
                Content = request.Content,
                IsRead = false
            };

            message.AddDomainEvent(new MessageCreatedEvent(message));

            _context.Messages.Add(message);

            // Update Conversation details
            conversation.LastMessage = message;
            conversation.LastMessageAt = DateTimeOffset.UtcNow;

            // SaveChanges first — EF Core assigns message.Id from DB BEFORE we broadcast
            await _context.SaveChangesAsync(cancellationToken);

            // Now message.Id is the real DB value — safe to broadcast via SignalR
            await BroadcastNewMessageAsync(message, conversation, otherParticipantId, cancellationToken);

            return Result.Success("Message sent successfully.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Error: {ex.Message}");
        }
    }

    private async Task BroadcastNewMessageAsync(
        Message message,
        Conversation conversation,
        string recipientId,
        CancellationToken cancellationToken)
    {
        try
        {
            // Retrieve sender profile info
            var senderUser = await _identityService.GetUserIdentityByIdAsync(message.SenderId);
            var senderName = senderUser?.FullName ?? "Unknown";
            var senderAvatar = senderUser?.Avatar;

            // Map to DTO — message.Id is now the real DB-assigned ID
            var messageDto = _mapper.Map<MessageDto>(message);
            messageDto.SenderName = senderName;
            messageDto.SenderAvatar = senderAvatar;

            // Broadcast to all clients in the conversation group
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
    }
}
