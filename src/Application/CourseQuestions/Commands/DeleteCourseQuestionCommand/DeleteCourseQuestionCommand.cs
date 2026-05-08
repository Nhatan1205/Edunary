using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

namespace Edunary.Application.CourseQuestions.Commands.DeleteCourseQuestionCommand;

public record DeleteCourseQuestionCommand : IRequest<Result>
{
    public int QuestionId { get; init; }
}

public class DeleteCourseQuestionCommandHandler : IRequestHandler<DeleteCourseQuestionCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public DeleteCourseQuestionCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(
        DeleteCourseQuestionCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var question = await _context.CourseQuestions
                .FindAsync(new object[] { request.QuestionId }, cancellationToken);

            Guard.Against.NotFound(request.QuestionId, question);

            // Only owner or instructor can delete
            if (question.CreatedBy != _currentUserService.UserId)
            {
                return Result.Failure("Not authorized to delete this question.");
            }

            _context.CourseQuestions.Remove(question);
            var result = await _context.SaveChangesAsync(cancellationToken);

            return result > 0
                ? Result.Success("Question deleted.")
                : Result.Failure("Failed to delete question.");
        }
        catch (Exception ex)
        {
            return Result.Failure(ex.Message);
        }
    }
}
