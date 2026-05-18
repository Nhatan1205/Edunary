using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseAnswers.Commands.DeleteCourseAnswerCommand;

public record DeleteCourseAnswerCommand : IRequest<Result>
{
    public int AnswerId { get; init; }
}

public class DeleteCourseAnswerCommandHandler
    : IRequestHandler<DeleteCourseAnswerCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public DeleteCourseAnswerCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<Result> Handle(
        DeleteCourseAnswerCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var answer = await _context.CourseAnswers
                .Include(a => a.Question)
                .FirstOrDefaultAsync(a => a.Id == request.AnswerId, cancellationToken);

            Guard.Against.NotFound(request.AnswerId, answer);

            var userId = _currentUserService.UserId;

            // Author OR QA access can delete
            var hasQaAccess = await _courseAuth.HasCourseAccessAsync(
                answer.Question.CourseId, userId, CoursePermission.QA, cancellationToken);

            if (answer.CreatedBy != userId && !hasQaAccess)
            {
                return Result.Failure("Not authorized to delete this answer.");
            }

            var question = await _context.CourseQuestions
                .FindAsync(new object[] { answer.QuestionId }, cancellationToken);

            if (question != null)
            {
                question.RemoveAnswer();
            }

            _context.CourseAnswers.Remove(answer);
            var result = await _context.SaveChangesAsync(cancellationToken);

            return result > 0
                ? Result.Success("Answer deleted.")
                : Result.Failure("Failed to delete answer.");
        }
        catch (Exception ex)
        {
            return Result.Failure(ex.Message);
        }
    }
}
