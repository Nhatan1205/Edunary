using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.DirectMessages.Commands.ToggleConversationReadCommand;

public class ToggleConversationReadCommand : IRequest<Result>
{
    public int ConversationId { get; set; }
    public bool IsRead { get; set; }
}

public class ToggleConversationReadCommandHandler : IRequestHandler<ToggleConversationReadCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;

    public ToggleConversationReadCommandHandler(IApplicationDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(ToggleConversationReadCommand request, CancellationToken cancellationToken)
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

            var setting = await _context.ConversationUserSettings
                .FirstOrDefaultAsync(s => s.ConversationId == conversation.Id && s.UserId == currentUserId, cancellationToken);

            if (request.IsRead)
            {
                // Mark all messages in the conversation as read using ExecuteUpdateAsync
                await _context.Messages
                    .Where(m => m.ConversationId == conversation.Id && !m.IsRead)
                    .ExecuteUpdateAsync(s => s.SetProperty(m => m.IsRead, true), cancellationToken);

                // Reset manual marked unread setting
                if (setting != null)
                {
                    setting.IsMarkedUnread = false;
                }
            }
            else
            {
                // Mark as unread
                if (setting == null)
                {
                    setting = new ConversationUserSetting
                    {
                        ConversationId = conversation.Id,
                        UserId = currentUserId,
                        IsMarkedUnread = true,
                        IsImportant = false
                    };
                    _context.ConversationUserSettings.Add(setting);
                }
                else
                {
                    setting.IsMarkedUnread = true;
                }

                // Set newest message IsRead = false
                var newestMessage = await _context.Messages
                    .Where(m => m.ConversationId == conversation.Id)
                    .OrderByDescending(m => m.Created)
                    .FirstOrDefaultAsync(cancellationToken);

                if (newestMessage != null)
                {
                    newestMessage.IsRead = false;
                }
            }

            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure($"Error: {ex.Message}");
        }
    }
}
