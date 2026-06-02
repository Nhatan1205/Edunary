using System;
using System.Threading;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.DirectMessages.Commands.ToggleConversationBlockCommand;

public class ToggleConversationBlockCommand : IRequest<Result>
{
    public int ConversationId { get; set; }
    public bool IsBlocked { get; set; }
}

public class ToggleConversationBlockCommandHandler : IRequestHandler<ToggleConversationBlockCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;

    public ToggleConversationBlockCommandHandler(IApplicationDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(ToggleConversationBlockCommand request, CancellationToken cancellationToken)
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

            // Verify user is a participant
            if (conversation.ParticipantOneId != currentUserId && conversation.ParticipantTwoId != currentUserId)
            {
                return Result.Failure("You are not a participant in this conversation.");
            }

            if (conversation.IsBlocked && !request.IsBlocked)
            {
                // Unblocking: only blocker can unblock
                if (conversation.LastModifiedBy != currentUserId)
                {
                    return Result.Failure("Only the user who blocked the conversation can unblock it.");
                }
            }

            conversation.IsBlocked = request.IsBlocked;
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure($"Error: {ex.Message}");
        }
    }
}
