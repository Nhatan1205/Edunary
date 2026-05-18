using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Microsoft.EntityFrameworkCore;
using Edunary.Domain.Enums;

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
    private readonly ICourseAuthorizationService _courseAuth;

    public ToggleFeaturedCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<ReturnResult<ToggleFeaturedDto>> Handle(
        ToggleFeaturedCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var question = await _context.CourseQuestions
                .FirstOrDefaultAsync(q => q.Id == request.QuestionId, cancellationToken);

            Guard.Against.NotFound(request.QuestionId, question);

            var userId = _currentUserService.UserId;
            var courseId = question.CourseId;

            if (!await _courseAuth.HasCourseAccessAsync(courseId, userId, CoursePermission.QA, cancellationToken))
            {
                return new ReturnResult<ToggleFeaturedDto>
                {
                    Result = null,
                    Message = "You don't have permission to mark questions as featured."
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
