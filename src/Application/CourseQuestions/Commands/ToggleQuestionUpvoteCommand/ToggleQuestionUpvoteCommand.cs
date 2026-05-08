using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseQuestions.Commands.ToggleQuestionUpvoteCommand;

public record ToggleQuestionUpvoteCommand : IRequest<ReturnResult<ToggleUpvoteDto>>
{
    public int QuestionId { get; init; }
}

public class ToggleUpvoteDto
{
    public int UpvoteCount { get; set; }
    public bool HasUpvoted { get; set; }
}

public class ToggleQuestionUpvoteCommandHandler
    : IRequestHandler<ToggleQuestionUpvoteCommand, ReturnResult<ToggleUpvoteDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ToggleQuestionUpvoteCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<ReturnResult<ToggleUpvoteDto>> Handle(
        ToggleQuestionUpvoteCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var question = await _context.CourseQuestions
                .FindAsync(new object[] { request.QuestionId }, cancellationToken);

            Guard.Against.NotFound(request.QuestionId, question);

            var userId = _currentUserService.UserId;

            // Enrollment check
            var isEnrolled = await _context.Enrollments
                .AnyAsync(e => e.CourseId == question.CourseId && e.StudentId == userId, cancellationToken);

            if (!isEnrolled)
            {
                return new ReturnResult<ToggleUpvoteDto>
                {
                    Result = null,
                    Message = "You must be enrolled in this course to upvote."
                };
            }

            var existing = await _context.QuestionUpvotes
                .FirstOrDefaultAsync(u => u.QuestionId == request.QuestionId && u.VoterId == userId, cancellationToken);

            bool hasUpvoted;

            if (existing != null)
            {
                // Remove upvote
                _context.QuestionUpvotes.Remove(existing);
                question.RemoveUpvote();
                hasUpvoted = false;
            }
            else
            {
                // Add upvote
                var upvote = new QuestionUpvote
                {
                    QuestionId = request.QuestionId,
                    VoterId = userId
                };
                _context.QuestionUpvotes.Add(upvote);
                question.AddUpvote();
                hasUpvoted = true;
            }

            await _context.SaveChangesAsync(cancellationToken);

            return new ReturnResult<ToggleUpvoteDto>
            {
                Result = new ToggleUpvoteDto
                {
                    UpvoteCount = question.UpvoteCount,
                    HasUpvoted = hasUpvoted
                },
                Message = hasUpvoted ? "Upvoted." : "Upvote removed."
            };
        }
        catch (Exception ex)
        {
            return new ReturnResult<ToggleUpvoteDto> { Result = null, Message = ex.Message };
        }
    }
}
