using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseQuestions.Commands.ToggleReadStatusCommand;

public record ToggleReadStatusCommand : IRequest<ReturnResult<ToggleReadStatusDto>>
{
    public int QuestionId { get; init; }
}

public class ToggleReadStatusDto
{
    public bool IsRead { get; set; }
}

public class ToggleReadStatusCommandHandler
    : IRequestHandler<ToggleReadStatusCommand, ReturnResult<ToggleReadStatusDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ToggleReadStatusCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<ReturnResult<ToggleReadStatusDto>> Handle(
        ToggleReadStatusCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var question = await _context.CourseQuestions
                .Include(q => q.Course)
                .FirstOrDefaultAsync(q => q.Id == request.QuestionId, cancellationToken);

            Guard.Against.NotFound(request.QuestionId, question);

            var userId = _currentUserService.UserId;

            // Only course instructor can toggle read status
            if (question.Course.CreatedBy != userId)
            {
                return new ReturnResult<ToggleReadStatusDto>
                {
                    Result = null,
                    Message = "Only the course instructor can manage read status."
                };
            }

            if (question.IsRead)
            {
                question.MarkAsUnread();
            }
            else
            {
                question.MarkAsRead();
            }

            await _context.SaveChangesAsync(cancellationToken);

            return new ReturnResult<ToggleReadStatusDto>
            {
                Result = new ToggleReadStatusDto { IsRead = question.IsRead },
                Message = question.IsRead ? "Marked as read." : "Marked as unread."
            };
        }
        catch (Exception ex)
        {
            return new ReturnResult<ToggleReadStatusDto> { Result = null, Message = ex.Message };
        }
    }
}
