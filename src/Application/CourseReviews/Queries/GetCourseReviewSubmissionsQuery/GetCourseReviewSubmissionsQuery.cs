using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseReviews.Queries.GetCourseReviewSubmissionsQuery;

public record GetCourseReviewSubmissionsQuery : IRequest<PaginatedList<CourseReviewSubmissionDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public ReviewSubmissionStatus? Status { get; init; } = ReviewSubmissionStatus.Pending;
    public bool? IsFirstSubmissionOnly { get; init; }
    public string SearchQuery { get; init; }
    public string SortBy { get; init; }
}

public class GetCourseReviewSubmissionsQueryHandler : IRequestHandler<GetCourseReviewSubmissionsQuery, PaginatedList<CourseReviewSubmissionDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public GetCourseReviewSubmissionsQueryHandler(
        IApplicationDbContext context,
        IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<PaginatedList<CourseReviewSubmissionDto>> Handle(GetCourseReviewSubmissionsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.CourseReviewSubmissions
            .AsNoTracking();

        // 1. Status Filter
        if (request.Status.HasValue)
        {
            query = query.Where(s => s.Status == request.Status.Value);
        }

        // 2. First Submission Filter
        if (request.IsFirstSubmissionOnly == true)
        {
            query = query.Where(s => s.SubmissionNumber == 1);
        }

        // 3. Search Query by Course Title
        if (!string.IsNullOrEmpty(request.SearchQuery))
        {
            var search = request.SearchQuery.Trim().ToLower();
            query = query.Where(s => s.Course.Title.ToLower().Contains(search));
        }

        // 4. Sort Options
        query = request.SortBy switch
        {
            "attempt_asc" => query.OrderBy(s => s.SubmissionNumber).ThenByDescending(s => s.Created),
            "attempt_desc" => query.OrderByDescending(s => s.SubmissionNumber).ThenByDescending(s => s.Created),
            "submitted_asc" => query.OrderBy(s => s.Created),
            _ => query.OrderByDescending(s => s.Created) // default: submitted newest
        };

        var projectedQuery = query.Select(s => new CourseReviewSubmissionDto
        {
            SubmissionId = s.Id,
            CourseId = s.CourseId,
            Title = s.Course.Title,
            ImageUrl = s.Course.ImageUrl,
            CategoryName = s.Course.Category.Title,
            InstructorId = s.Course.CreatedBy,
            SubmissionNumber = s.SubmissionNumber,
            SubmittedAt = s.Created,
        });

        var paged = await projectedQuery.PaginatedListAsync(request.PageNumber, request.PageSize);

        // Enrich instructor name + avatar (batch fetch)
        var instructorIds = paged.Items.Select(x => x.InstructorId).Distinct().ToList();
        var identities = await _identityService.GetUserIdentitiesByIdsAsync(instructorIds, cancellationToken);
        var identityMap = identities.ToDictionary(u => u.Id);

        foreach (var item in paged.Items)
        {
            if (identityMap.TryGetValue(item.InstructorId, out var identity))
            {
                item.InstructorName = identity.FullName;
                item.InstructorAvatar = identity.Avatar;
            }
        }

        return paged;
    }
}
