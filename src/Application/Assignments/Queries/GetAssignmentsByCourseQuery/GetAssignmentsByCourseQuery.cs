using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.Assignments.Queries.GetAssignmentsByCourseQuery;

public record GetAssignmentsByCourseQuery : IRequest<List<AssignmentSummaryDto>>
{
    public int CourseId { get; init; }
}

public class GetAssignmentsByCourseQueryHandler : IRequestHandler<GetAssignmentsByCourseQuery, List<AssignmentSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetAssignmentsByCourseQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<AssignmentSummaryDto>> Handle(GetAssignmentsByCourseQuery request, CancellationToken cancellationToken)
    {
        bool instructorOwns = await _context.Courses
            .AnyAsync(c => c.Id == request.CourseId && c.CreatedBy == _currentUserService.UserId, cancellationToken);

        if (!instructorOwns)
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
