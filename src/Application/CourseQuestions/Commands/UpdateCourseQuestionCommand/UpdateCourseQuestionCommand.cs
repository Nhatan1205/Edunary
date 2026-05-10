using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseQuestions.Commands.UpdateCourseQuestionCommand;

public record UpdateCourseQuestionCommand : IRequest<Result>
{
    public int QuestionId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Detail { get; init; } = string.Empty;
}

public class UpdateCourseQuestionCommandHandler : IRequestHandler<UpdateCourseQuestionCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateCourseQuestionCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(
        UpdateCourseQuestionCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var question = await _context.CourseQuestions
                .FindAsync(new object[] { request.QuestionId }, cancellationToken);

            Guard.Against.NotFound(request.QuestionId, question);

            var userId = _currentUserService.UserId;

            // Only author can edit
            if (question.CreatedBy != userId)
            {
                return Result.Failure("Only the author can edit this question.");
            }

            question.Title = request.Title;
            question.Detail = request.Detail;

            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success("Question updated.");
        }
        catch (Exception ex)
        {
            return Result.Failure(ex.Message);
        }
    }
}
