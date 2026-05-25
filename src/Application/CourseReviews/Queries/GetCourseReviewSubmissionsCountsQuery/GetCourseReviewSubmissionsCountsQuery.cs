using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseReviews.Queries.GetCourseReviewSubmissionsCountsQuery;

public record GetCourseReviewSubmissionsCountsQuery : IRequest<CourseReviewSubmissionsCountsDto>
{
    public bool? IsFirstSubmissionOnly { get; init; }
    public string SearchQuery { get; init; }
}

public class GetCourseReviewSubmissionsCountsQueryHandler : IRequestHandler<GetCourseReviewSubmissionsCountsQuery, CourseReviewSubmissionsCountsDto>
{
    private readonly IApplicationDbContext _context;

    public GetCourseReviewSubmissionsCountsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CourseReviewSubmissionsCountsDto> Handle(GetCourseReviewSubmissionsCountsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.CourseReviewSubmissions.AsNoTracking();

        // Only get the latest submission for each course
        query = query.Where(s => !_context.CourseReviewSubmissions.Any(s2 => s2.CourseId == s.CourseId && s2.SubmissionNumber > s.SubmissionNumber));

        if (request.IsFirstSubmissionOnly == true)
        {
            query = query.Where(s => s.SubmissionNumber == 1);
        }

        if (!string.IsNullOrEmpty(request.SearchQuery))
        {
            var search = request.SearchQuery.Trim().ToLower();
            query = query.Where(s => s.Course.Title.ToLower().Contains(search));
        }

        var pendingCount = await query.CountAsync(s => s.Status == ReviewSubmissionStatus.Pending, cancellationToken);
        var needsChangesCount = await query.CountAsync(s => s.Status == ReviewSubmissionStatus.NeedsChanges, cancellationToken);
        var approvedCount = await query.CountAsync(s => s.Status == ReviewSubmissionStatus.Approved, cancellationToken);

        return new CourseReviewSubmissionsCountsDto
        {
            PendingCount = pendingCount,
            NeedsChangesCount = needsChangesCount,
            ApprovedCount = approvedCount
        };
    }
}
