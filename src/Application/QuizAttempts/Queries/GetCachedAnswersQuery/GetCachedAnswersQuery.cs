using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.QuizAttempts.Queries.GetCachedAnswersQuery;

public class CachedAnswersDto
{
    public Dictionary<int, List<int>> Answers { get; set; } = new();
}

public record GetCachedAnswersQuery : IRequest<CachedAnswersDto>
{
    public int AttemptId { get; init; }
    public int QuizId { get; init; }
}

public class GetCachedAnswersQueryHandler : IRequestHandler<GetCachedAnswersQuery, CachedAnswersDto>
{
    private readonly IQuizCacheService _cacheService;
    private readonly ICurrentUserService _currentUserService;

    public GetCachedAnswersQueryHandler(IQuizCacheService cacheService, ICurrentUserService currentUserService)
    {
        _cacheService = cacheService;
        _currentUserService = currentUserService;
    }

    public async Task<CachedAnswersDto> Handle(GetCachedAnswersQuery request, CancellationToken cancellationToken)
    {
        Dictionary<int, List<int>> answers = await _cacheService.GetCachedAnswersAsync(
            _currentUserService.UserId,
            request.AttemptId,
            request.QuizId,
            cancellationToken);

        return new CachedAnswersDto { Answers = answers };
    }
}
