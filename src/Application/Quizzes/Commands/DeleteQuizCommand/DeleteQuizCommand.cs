using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.Quizzes.Commands.DeleteQuizCommand;

public record DeleteQuizCommand : IRequest<Result>
{
    public int QuizId { get; init; }
}

public class DeleteQuizCommandHandler : IRequestHandler<DeleteQuizCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public DeleteQuizCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(DeleteQuizCommand request, CancellationToken cancellationToken)
    {
        Quiz quiz = await _context.Quizzes
            .Include(q => q.Course)
            .FirstOrDefaultAsync(q => q.Id == request.QuizId, cancellationToken);

        if (quiz == null)
            return Result.Failure(new[] { "Quiz not found." });

        if (quiz.Course.CreatedBy != _currentUserService.UserId)
            return Result.Failure(new[] { "Access denied." });

        _context.Quizzes.Remove(quiz); // Cascade deletes Questions, Choices, Snapshots
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
