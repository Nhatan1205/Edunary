using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;

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
    private readonly ICourseAuthorizationService _courseAuth;

    public GetQuizzesByCourseQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<List<QuizSummaryDto>> Handle(GetQuizzesByCourseQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        bool hasAccess = await _courseAuth.HasCourseAccessAsync(request.CourseId, userId, cancellationToken: cancellationToken);
        if (!hasAccess)
            return new List<QuizSummaryDto>();

        return await _context.Quizzes
            .Where(q => q.CourseId == request.CourseId)
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
