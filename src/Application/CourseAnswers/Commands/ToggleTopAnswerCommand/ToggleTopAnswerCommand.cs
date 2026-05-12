using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseAnswers.Commands.ToggleTopAnswerCommand;

public record ToggleTopAnswerCommand : IRequest<ReturnResult<ToggleTopAnswerDto>>
{
    public int AnswerId { get; init; }
}

public class ToggleTopAnswerDto
{
    public bool IsTopAnswer { get; set; }
}

public class ToggleTopAnswerCommandHandler
    : IRequestHandler<ToggleTopAnswerCommand, ReturnResult<ToggleTopAnswerDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ToggleTopAnswerCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<ReturnResult<ToggleTopAnswerDto>> Handle(
        ToggleTopAnswerCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var answer = await _context.CourseAnswers
                .Include(a => a.Question)
                    .ThenInclude(q => q.Course)
                .FirstOrDefaultAsync(a => a.Id == request.AnswerId, cancellationToken);

            Guard.Against.NotFound(request.AnswerId, answer);

            var userId = _currentUserService.UserId;

            // Only course instructor can toggle top answer
            if (answer.Question.Course.CreatedBy != userId)
            {
                return new ReturnResult<ToggleTopAnswerDto>
                {
                    Result = null,
                    Message = "Only the course instructor can mark top answers."
                };
            }

            if (answer.IsTopAnswer)
            {
                answer.UnmarkAsTopAnswer();
            }
            else
            {
                answer.MarkAsTopAnswer();
            }

            await _context.SaveChangesAsync(cancellationToken);

            return new ReturnResult<ToggleTopAnswerDto>
            {
                Result = new ToggleTopAnswerDto { IsTopAnswer = answer.IsTopAnswer },
                Message = answer.IsTopAnswer ? "Marked as top answer." : "Removed from top answers."
            };
        }
        catch (Exception ex)
        {
            return new ReturnResult<ToggleTopAnswerDto> { Result = null, Message = ex.Message };
        }
    }
}
