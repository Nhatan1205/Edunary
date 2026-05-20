using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.RatingCourses.Queries.GetInstructorReviewsQuery;

// Query to get reviews for instructor's courses with pagination and filters
public record GetInstructorReviewsQuery : IRequest<PaginatedList<InstructorReviewDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public int? CourseId { get; init; }
    public int? Rating { get; init; }
    public bool? NotAnswered { get; init; }
    public bool? HasComment { get; init; }
    public string SortBy { get; init; } = "newest";
}

// Handler for retrieving filtered instructor reviews
public class GetInstructorReviewsQueryHandler : IRequestHandler<GetInstructorReviewsQuery, PaginatedList<InstructorReviewDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly ICurrentUserService _currentUserService;

    public GetInstructorReviewsQueryHandler(
        IApplicationDbContext context,
        IIdentityService identityService,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _identityService = identityService;
        _currentUserService = currentUserService;
    }

    public async Task<PaginatedList<InstructorReviewDto>> Handle(GetInstructorReviewsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        if (string.IsNullOrEmpty(userId))
        {
            return new PaginatedList<InstructorReviewDto>(new List<InstructorReviewDto>(), 0, request.PageNumber, request.PageSize);
        }

        // 1. Get list of courses where current user is owner or collaborator with reviews permission
        var allowedCourseIds = await _context.Courses
            .Where(c => c.CreatedBy == userId || c.Collaborators.Any(cc => cc.UserId == userId && cc.InviteStatus == CollaboratorInviteStatus.Accepted && cc.Permissions.HasFlag(CoursePermission.Reviews)))
            .Select(c => c.Id)
            .ToListAsync(cancellationToken);

        // 2. Filter course
        if (request.CourseId.HasValue)
        {
            if (!allowedCourseIds.Contains(request.CourseId.Value))
            {
                return new PaginatedList<InstructorReviewDto>(new List<InstructorReviewDto>(), 0, request.PageNumber, request.PageSize);
            }
            allowedCourseIds = new List<int> { request.CourseId.Value };
        }

        var query = _context.RatingCourses
            .Include(rc => rc.Course)
            .Include(rc => rc.RatingResponse)
            .Where(rc => allowedCourseIds.Contains(rc.CourseId))
            .AsQueryable();

        // 3. Filer rating
        if (request.Rating.HasValue && request.Rating >= 1 && request.Rating <= 5)
        {
            query = query.Where(rc => rc.Rating == request.Rating.Value);
        }

        // 4. Filter reviews that have not been responded to yet
        if (request.NotAnswered == true)
        {
            query = query.Where(rc => rc.RatingResponse == null);
        }

        // 5. Filter reviews that contain actual text comments
        if (request.HasComment == true)
        {
            query = query.Where(rc => !string.IsNullOrEmpty(rc.Review));
        }

        // 6. sorting
        query = request.SortBy?.ToLower() switch
        {
            "oldest" => query.OrderBy(rc => rc.Created),
            _ => query.OrderByDescending(rc => rc.Created)
        };

        var paginatedReviews = await query
            .Select(rc => new InstructorReviewDto
            {
                Id = rc.Id,
                CourseId = rc.CourseId,
                CourseTitle = rc.Course.Title,
                CourseImageUrl = rc.Course.ImageUrl,
                CourseRating = rc.Course.Ratings,
                StudentId = rc.UserId,
                Rating = rc.Rating,
                Review = rc.Review ?? string.Empty,
                Created = rc.Created,
                LastModified = rc.LastModified,
                RatingResponse = rc.RatingResponse != null ? new RatingResponseDto
                {
                    Id = rc.RatingResponse.Id,
                    ResponseText = rc.RatingResponse.ResponseText,
                    RespondedBy = rc.RatingResponse.CreatedBy,
                    RespondedAt = rc.RatingResponse.Created
                } : null
            })
            .PaginatedListAsync(request.PageNumber, request.PageSize);

        // fetch student/instructor info
        var userIds = paginatedReviews.Items.Select(r => r.StudentId)
            .Union(paginatedReviews.Items.Where(r => r.RatingResponse != null).Select(r => r.RatingResponse!.RespondedBy))
            .Distinct()
            .ToList();

        var users = await _identityService.GetUserIdentitiesByIdsAsync(userIds, cancellationToken);
        var userCache = users.ToDictionary(u => u.Id, u => (u.FullName, u.Avatar));

        foreach (var review in paginatedReviews.Items)
        {
            if (userCache.TryGetValue(review.StudentId, out var studentInfo))
            {
                review.StudentFullName = studentInfo.FullName;
                review.StudentAvatar = studentInfo.Avatar;
            }

            if (review.RatingResponse != null && userCache.TryGetValue(review.RatingResponse.RespondedBy, out var instructorInfo))
            {
                review.RatingResponse.InstructorFullName = instructorInfo.FullName;
                review.RatingResponse.InstructorAvatar = instructorInfo.Avatar;
            }
        }

        return paginatedReviews;
    }
}
