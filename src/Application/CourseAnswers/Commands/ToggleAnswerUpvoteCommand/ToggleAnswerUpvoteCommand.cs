using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseAnswers.Commands.ToggleAnswerUpvoteCommand;

public record ToggleAnswerUpvoteCommand : IRequest<ReturnResult<ToggleAnswerUpvoteDto>>
{
    public int AnswerId { get; init; }
}

public class ToggleAnswerUpvoteDto
{
    public int UpvoteCount { get; set; }
    public bool HasUpvoted { get; set; }
}

public class ToggleAnswerUpvoteCommandHandler
    : IRequestHandler<ToggleAnswerUpvoteCommand, ReturnResult<ToggleAnswerUpvoteDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ToggleAnswerUpvoteCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<ReturnResult<ToggleAnswerUpvoteDto>> Handle(
        ToggleAnswerUpvoteCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var answer = await _context.CourseAnswers
                .Include(a => a.Question)
                .FirstOrDefaultAsync(a => a.Id == request.AnswerId, cancellationToken);

            Guard.Against.NotFound(request.AnswerId, answer);

            var userId = _currentUserService.UserId;

            // Allow enrolled students OR the course instructor
            var course = await _context.Courses
                .Where(c => c.Id == answer.Question.CourseId)
                .Select(c => new { c.CreatedBy })
                .FirstOrDefaultAsync(cancellationToken);

            var isInstructor = course?.CreatedBy == userId;

            // Enrollment check
            var isEnrolled = await _context.Enrollments
                .AnyAsync(e => e.CourseId == answer.Question.CourseId && e.StudentId == userId, cancellationToken);

            if (!isEnrolled && !isInstructor)
            {
                return new ReturnResult<ToggleAnswerUpvoteDto>
                {
                    Result = null,
                    Message = "You must be enrolled in this course to upvote."
                };
            }

            var existing = await _context.AnswerUpvotes
                .FirstOrDefaultAsync(u => u.AnswerId == request.AnswerId && u.VoterId == userId, cancellationToken);

            bool hasUpvoted;

            if (existing != null)
            {
                // Remove upvote
                _context.AnswerUpvotes.Remove(existing);
                answer.RemoveUpvote();
                hasUpvoted = false;
            }
            else
            {
                // Add upvote
                var upvote = new AnswerUpvote
                {
                    AnswerId = request.AnswerId,
                    VoterId = userId
                };
                _context.AnswerUpvotes.Add(upvote);
                answer.AddUpvote();
                hasUpvoted = true;
            }

            await _context.SaveChangesAsync(cancellationToken);

            return new ReturnResult<ToggleAnswerUpvoteDto>
            {
                Result = new ToggleAnswerUpvoteDto
                {
                    UpvoteCount = answer.UpvoteCount,
                    HasUpvoted = hasUpvoted
                },
                Message = hasUpvoted ? "Upvoted." : "Upvote removed."
            };
        }
        catch (Exception ex)
        {
            return new ReturnResult<ToggleAnswerUpvoteDto> { Result = null, Message = ex.Message };
        }
    }
}
