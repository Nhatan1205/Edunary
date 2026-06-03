using System;
using System.Threading;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.DirectMessages.Commands.CreateConversationCommand;

public class CreateConversationCommand : IRequest<ReturnResult<int>>
{
    public string TargetUserId { get; set; }
}

public class CreateConversationCommandHandler : IRequestHandler<CreateConversationCommand, ReturnResult<int>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;

    public CreateConversationCommandHandler(
        IApplicationDbContext context,
        IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ReturnResult<int>> Handle(CreateConversationCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var currentUserId = _currentUser.Id;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return new ReturnResult<int>
                {
                    Result = 0,
                    Message = "User is not authenticated."
                };
            }

            var targetUserId = request.TargetUserId;

            if (currentUserId == targetUserId)
            {
                return new ReturnResult<int>
                {
                    Result = 0,
                    Message = "You cannot create a conversation with yourself."
                };
            }

            // Sort ParticipantOneId and ParticipantTwoId alphabetically to avoid duplicate conversations
            var participantOneId = string.Compare(currentUserId, targetUserId, StringComparison.Ordinal) < 0 ? currentUserId : targetUserId;
            var participantTwoId = participantOneId == currentUserId ? targetUserId : currentUserId;

            var conversation = await _context.Conversations
                .FirstOrDefaultAsync(c => c.ParticipantOneId == participantOneId && c.ParticipantTwoId == participantTwoId, cancellationToken);

            if (conversation == null)
            {
                conversation = new Conversation
                {
                    ParticipantOneId = participantOneId,
                    ParticipantTwoId = participantTwoId,
                    LastMessageAt = DateTimeOffset.UtcNow,
                    LastMessageId = null,
                    IsBlocked = false
                };

                _context.Conversations.Add(conversation);
                await _context.SaveChangesAsync(cancellationToken);
            }

            return new ReturnResult<int>
            {
                Result = conversation.Id,
                Message = "Conversation retrieved or created successfully."
            };
        }
        catch (Exception ex)
        {
            return new ReturnResult<int>
            {
                Result = 0,
                Message = $"Error: {ex.Message}"
            };
        }
    }
}


