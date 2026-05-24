using AutoMapper;
using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Constants;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseReviews.Queries.GetCourseReviewStatusQuery;

public record GetCourseReviewStatusQuery : IRequest<CourseReviewStatusDto>
{
    public int CourseId { get; init; }
}

public class GetCourseReviewStatusQueryHandler : IRequestHandler<GetCourseReviewStatusQuery, CourseReviewStatusDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;
    private readonly IIdentityService _identityService;
    private readonly IMapper _mapper;

    public GetCourseReviewStatusQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth,
        IIdentityService identityService,
        IMapper mapper)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
        _identityService = identityService;
        _mapper = mapper;
    }

    public async Task<CourseReviewStatusDto> Handle(GetCourseReviewStatusQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        // Access check — owner, collaborator, or administrator
        var hasAccess = await _courseAuth.HasCourseAccessAsync(
            request.CourseId, userId, CoursePermission.None, cancellationToken);
        var isAdmin = await _identityService.IsInRoleAsync(userId, Roles.Administrator);

        if (!hasAccess && !isAdmin)
        {
            throw new UnauthorizedAccessException("You do not have access to this course.");
        }

        var course = await _context.Courses
            .AsNoTracking()
            .Where(c => c.Id == request.CourseId)
            .Select(c => new { c.Id, c.Status })
            .FirstOrDefaultAsync(cancellationToken);

        Guard.Against.NotFound(request.CourseId, course);

        // Load all submissions with feedbacks (ordered)
        var submissions = await _context.CourseReviewSubmissions
            .AsNoTracking()
            .Include(s => s.Feedbacks)
            .Where(s => s.CourseId == request.CourseId)
            .OrderByDescending(s => s.SubmissionNumber)
            .ToListAsync(cancellationToken);

        // Build history from all submissions (include feedbacks)
        var history = _mapper.Map<List<SubmissionHistoryItemDto>>(submissions.Skip(1));

        var latest = submissions.FirstOrDefault();
        var latestDto = latest != null ? _mapper.Map<LatestSubmissionDto>(latest) : null;

        return new CourseReviewStatusDto
        {
            CourseId = course.Id,
            CourseStatus = course.Status,
            LatestSubmission = latestDto,
            SubmissionHistory = history,
        };
    }
}
