using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;

namespace Edunary.Application.Assignments.Queries.GetAssignmentsByCourseQuery;

public record GetAssignmentsByCourseQuery : IRequest<List<AssignmentSummaryDto>>
{
    public int CourseId { get; init; }
}

public class GetAssignmentsByCourseQueryHandler : IRequestHandler<GetAssignmentsByCourseQuery, List<AssignmentSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public GetAssignmentsByCourseQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<List<AssignmentSummaryDto>> Handle(GetAssignmentsByCourseQuery request, CancellationToken cancellationToken)
    {
        bool canManage = await _courseAuth.HasCourseAccessAsync(request.CourseId, _currentUserService.UserId, CoursePermission.None, cancellationToken);

        if (!canManage)
        {
            return new List<AssignmentSummaryDto>();
        }

        List<Domain.Entities.Assignment> assignments = await _context.Assignments
            .Include(a => a.Questions)
            .Where(a => a.CourseId == request.CourseId)
            .OrderByDescending(a => a.Created)
            .ToListAsync(cancellationToken);

        return assignments.Select(a => new AssignmentSummaryDto
        {
            Id = a.Id,
            Title = a.Title,
            ItemId = a.ItemId,
            IsPublished = a.IsPublished,
            EstimatedDurationMinutes = a.EstimatedDurationMinutes,
            QuestionCount = a.Questions.Count
        }).ToList();
    }
}
