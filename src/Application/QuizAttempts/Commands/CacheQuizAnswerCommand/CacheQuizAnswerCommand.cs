using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

namespace Edunary.Application.QuizAttempts.Commands.CacheQuizAnswerCommand;

public record CacheQuizAnswerCommand : IRequest<Result>
{
    public int AttemptId { get; init; }
    public int QuizId { get; init; }
    public int QuestionId { get; init; }
    public List<int> SelectedChoiceIds { get; init; } = new();
}

public class CacheQuizAnswerCommandHandler : IRequestHandler<CacheQuizAnswerCommand, Result>
{
    private readonly IQuizCacheService _cacheService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public CacheQuizAnswerCommandHandler(
        IQuizCacheService cacheService,
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _cacheService = cacheService;
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result> Handle(CacheQuizAnswerCommand request, CancellationToken cancellationToken)
    {
        string userId = _currentUserService.UserId;

        // Verify the attempt belongs to the current user and is still active
        bool validAttempt = await _context.QuizAttempts
            .AnyAsync(a => a.Id == request.AttemptId && a.UserId == userId && a.IsActive, cancellationToken);

        if (!validAttempt)
            return Result.Failure(new[] { "Invalid or inactive attempt." });

        await _cacheService.CacheAnswerAsync(
            userId,
            request.AttemptId,
            request.QuizId,
            request.QuestionId,
            request.SelectedChoiceIds,
            cancellationToken);

        return Result.Success();
    }
}
