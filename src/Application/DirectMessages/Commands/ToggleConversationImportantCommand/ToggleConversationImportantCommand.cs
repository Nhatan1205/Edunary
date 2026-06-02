using System;
using System.Threading;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.DirectMessages.Commands.ToggleConversationImportantCommand;

public class ToggleConversationImportantCommand : IRequest<Result>
{
    public int ConversationId { get; set; }
    public bool IsImportant { get; set; }
}

public class ToggleConversationImportantCommandHandler : IRequestHandler<ToggleConversationImportantCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;

    public ToggleConversationImportantCommandHandler(IApplicationDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(ToggleConversationImportantCommand request, CancellationToken cancellationToken)
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

            if (setting == null)
            {
                setting = new ConversationUserSetting
                {
                    ConversationId = conversation.Id,
                    UserId = currentUserId,
                    IsMarkedUnread = false,
                    IsImportant = request.IsImportant
                };
                _context.ConversationUserSettings.Add(setting);
            }
            else
            {
                setting.IsImportant = request.IsImportant;
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
