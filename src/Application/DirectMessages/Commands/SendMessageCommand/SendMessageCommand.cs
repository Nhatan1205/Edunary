using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;

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

    public SendMessageCommandHandler(
        IApplicationDbContext context,
        IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
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

            var otherParticipantId = conversation.ParticipantOneId == currentUserId ? conversation.ParticipantTwoId : conversation.ParticipantOneId;

            // Check if current user is the instructor of the other participant
            var currentIsInstructor = await IsInstructorForParticipantAsync(currentUserId, otherParticipantId, cancellationToken);

            if (conversation.IsBlocked)
            {
                if (currentIsInstructor)
                {
                    // Auto-unblock if instructor sends a message
                    conversation.IsBlocked = false;
                }
                else
                {
                    return Result.Failure("You cannot send messages because the conversation is blocked.");
                }
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

            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success("Message sent successfully.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Error: {ex.Message}");
        }
    }

    private async Task<bool> IsInstructorForParticipantAsync(string instructorId, string studentId, CancellationToken cancellationToken)
    {
        var studentEnrollments = await _context.Enrollments
            .Where(e => e.StudentId == studentId)
            .Select(e => e.CourseId)
            .ToListAsync(cancellationToken);

        if (!studentEnrollments.Any())
        {
            return false;
        }

        var isOwner = await _context.Courses
            .AnyAsync(c => c.CreatedBy == instructorId && studentEnrollments.Contains(c.Id), cancellationToken);

        if (isOwner)
        {
            return true;
        }

        var isCollaborator = await _context.CourseCollaborators
            .AnyAsync(cc => cc.UserId == instructorId
                && cc.IsVisible
                && cc.InviteStatus == Domain.Enums.CollaboratorInviteStatus.Accepted
                && studentEnrollments.Contains(cc.CourseId), cancellationToken);

        return isCollaborator;
    }
}

