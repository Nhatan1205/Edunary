using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.Quizzes.Queries.GetQuizzesByCourseQuery;

public class QuizSummaryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ItemId { get; set; } = string.Empty;
#nullable enable
    public string? RelatedItemId { get; set; }
#nullable disable
}

public record GetQuizzesByCourseQuery : IRequest<List<QuizSummaryDto>>
{
    public int CourseId { get; init; }
}

public class GetQuizzesByCourseQueryHandler : IRequestHandler<GetQuizzesByCourseQuery, List<QuizSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetQuizzesByCourseQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<QuizSummaryDto>> Handle(GetQuizzesByCourseQuery request, CancellationToken cancellationToken)
    {
        return await _context.Quizzes
            .Include(q => q.Course)
            .Where(q => q.CourseId == request.CourseId && q.Course.CreatedBy == _currentUserService.UserId)
            .Select(q => new QuizSummaryDto
            {
                Id = q.Id,
                Title = q.Title,
                ItemId = q.ItemId,
                RelatedItemId = q.RelatedItemId,
            })
            .ToListAsync(cancellationToken);
    }
}
