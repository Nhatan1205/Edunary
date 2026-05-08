using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseQuestions.Commands.ToggleFeaturedCommand;

public record ToggleFeaturedCommand : IRequest<ReturnResult<ToggleFeaturedDto>>
{
    public int QuestionId { get; init; }
}

public class ToggleFeaturedDto
{
    public bool IsFeatured { get; set; }
}

public class ToggleFeaturedCommandHandler
    : IRequestHandler<ToggleFeaturedCommand, ReturnResult<ToggleFeaturedDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ToggleFeaturedCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<ReturnResult<ToggleFeaturedDto>> Handle(
        ToggleFeaturedCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var question = await _context.CourseQuestions
                .Include(q => q.Course)
                .FirstOrDefaultAsync(q => q.Id == request.QuestionId, cancellationToken);

            Guard.Against.NotFound(request.QuestionId, question);

            var userId = _currentUserService.UserId;

            // Only course instructor can toggle featured
            if (question.Course.CreatedBy != userId)
            {
                return new ReturnResult<ToggleFeaturedDto>
                {
                    Result = null,
                    Message = "Only the course instructor can mark questions as featured."
                };
            }

            if (question.IsFeatured)
            {
                question.UnmarkAsFeatured();
            }
            else
            {
                question.MarkAsFeatured();
            }

            await _context.SaveChangesAsync(cancellationToken);

            return new ReturnResult<ToggleFeaturedDto>
            {
                Result = new ToggleFeaturedDto { IsFeatured = question.IsFeatured },
                Message = question.IsFeatured ? "Marked as featured." : "Removed from featured."
            };
        }
        catch (Exception ex)
        {
            return new ReturnResult<ToggleFeaturedDto> { Result = null, Message = ex.Message };
        }
    }
}
