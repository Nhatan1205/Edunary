using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.QuizAttempts.Queries.GetAttemptHistoryQuery;

public record GetAttemptHistoryQuery : IRequest<List<AttemptHistoryItemDto>>
{
    public int QuizId { get; init; }
}

public class GetAttemptHistoryQueryHandler : IRequestHandler<GetAttemptHistoryQuery, List<AttemptHistoryItemDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetAttemptHistoryQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<AttemptHistoryItemDto>> Handle(GetAttemptHistoryQuery request, CancellationToken cancellationToken)
    {
        List<AttemptHistoryItemDto> history = await _context.QuizAttempts
            .Where(a => a.QuizId == request.QuizId && a.UserId == _currentUserService.UserId)
            .OrderByDescending(a => a.Created)
            .Select(a => new AttemptHistoryItemDto
            {
                AttemptId = a.Id,
                Score = a.Score,
                IsPassed = a.IsPassed,
                IsActive = a.IsActive,
                StartTime = a.StartTime,
                ExpiryTime = a.ExpiryTime,
                Completed = a.LastModified
            })
            .ToListAsync(cancellationToken);

        return history;
    }
}
