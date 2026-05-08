using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

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

    public DeleteCourseAnswerCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(
        DeleteCourseAnswerCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var answer = await _context.CourseAnswers
                .FindAsync(new object[] { request.AnswerId }, cancellationToken);

            Guard.Against.NotFound(request.AnswerId, answer);

            if (answer.CreatedBy != _currentUserService.UserId)
            {
                return Result.Failure("Not authorized to delete this answer.");
            }

            // Decrement denormalized count on parent question
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
