using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;

namespace Edunary.Application.AssignmentSubmissions.Queries.GetInstructorSubmissionsQuery;

public record GetInstructorSubmissionsQuery : IRequest<PaginatedList<InstructorSubmissionListDto>>
{
    public int? CourseId { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string ReadFilter { get; init; } = "all";
    public string FeedbackFilter { get; init; } = "all";
    public string SortBy { get; init; } = "newestFirst";
}

public class GetInstructorSubmissionsQueryHandler : IRequestHandler<GetInstructorSubmissionsQuery, PaginatedList<InstructorSubmissionListDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;

    public GetInstructorSubmissionsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IIdentityService identityService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _identityService = identityService;
    }

    public async Task<PaginatedList<InstructorSubmissionListDto>> Handle(GetInstructorSubmissionsQuery request, CancellationToken cancellationToken)
    {
        string userId = _currentUserService.UserId;

        // Courses the instructor can access for Assignments: owned OR collaborated with Assignments permission
        var accessibleCourseIds = _context.Courses
            .Where(c => c.CreatedBy == userId ||
                        c.Collaborators.Any(cc =>
                            cc.UserId == userId &&
                            cc.InviteStatus == CollaboratorInviteStatus.Accepted &&
                            cc.Permissions.HasFlag(CoursePermission.Assignments)))
            .Select(c => c.Id);

        var query = _context.AssignmentSubmissions
            .Include(s => s.Feedbacks)
            .Include(s => s.Assignment)
                .ThenInclude(a => a.Course)
            .Where(s =>
                s.Status == AssignmentSubmissionStatus.Submitted &&
                accessibleCourseIds.Contains(s.Assignment.CourseId));

        // Optional course filter
        if (request.CourseId.HasValue)
            query = query.Where(s => s.Assignment.CourseId == request.CourseId.Value);

        // Read filter
        if (request.ReadFilter == "unread")
            query = query.Where(s => !s.IsRead);
        else if (request.ReadFilter == "read")
            query = query.Where(s => s.IsRead);

        // Feedback type filter
        if (request.FeedbackFilter == "none")
            query = query.Where(s => !s.Feedbacks.Any());
        else if (request.FeedbackFilter == "has_feedback")
            query = query.Where(s => s.Feedbacks.Any());

        // Sort
        query = request.SortBy == "oldestFirst"
            ? query.OrderBy(s => s.Created)
            : query.OrderByDescending(s => s.Created);

        int totalCount = await query.CountAsync(cancellationToken);

        var submissions = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var studentIds = submissions
            .Select(s => s.StudentId)
            .Distinct()
            .ToList();

        var students = await _identityService.GetUserIdentitiesByIdsAsync(studentIds, cancellationToken);
        var studentDict = students.ToDictionary(u => u.Id);

        var dtos = new List<InstructorSubmissionListDto>();
        foreach (var s in submissions)
        {
            studentDict.TryGetValue(s.StudentId, out var student);
            dtos.Add(new InstructorSubmissionListDto
            {
                SubmissionId = s.Id,
                StudentId = s.StudentId,
                StudentName = student?.FullName ?? "Unknown",
                StudentAvatar = student?.Avatar ?? string.Empty,
                SubmittedAt = s.Created,
                IsRead = s.IsRead,
                FeedbackCount = s.Feedbacks.Count,
                AssignmentId = s.AssignmentId,
                AssignmentTitle = s.Assignment.Title,
                CourseId = s.Assignment.CourseId,
                CourseTitle = s.Assignment.Course.Title,
            });
        }

        return new PaginatedList<InstructorSubmissionListDto>(dtos, totalCount, request.PageNumber, request.PageSize);
    }
}
