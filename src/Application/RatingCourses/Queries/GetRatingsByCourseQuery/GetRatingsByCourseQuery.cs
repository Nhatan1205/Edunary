using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.RatingCourses.Queries.GetRatingsByCourseQuery;

public record GetRatingsByCourseQuery : IRequest<PaginatedList<RatingCourseWithUserDto>>
{
    public int CourseId { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public int? FilterRating { get; init; } // Filter by specific rating (1-5)
    public string SortBy { get; init; } = "newest"; // newest, oldest, highest, lowest
}

public class GetRatingsByCourseQueryHandler : IRequestHandler<GetRatingsByCourseQuery, PaginatedList<RatingCourseWithUserDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public GetRatingsByCourseQueryHandler(IApplicationDbContext context, IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<PaginatedList<RatingCourseWithUserDto>> Handle(GetRatingsByCourseQuery request, CancellationToken cancellationToken)
    {
        var query = _context.RatingCourses
            .Include(r => r.RatingResponse)
            .Where(r => r.CourseId == request.CourseId)
            .AsQueryable();

        // Apply rating filter if specified
        if (request.FilterRating.HasValue && request.FilterRating.Value >= 1 && request.FilterRating.Value <= 5)
        {
            query = query.Where(r => r.Rating == request.FilterRating.Value);
        }

        // Apply sorting
        query = request.SortBy?.ToLower() switch
        {
            "oldest" => query.OrderBy(r => r.Created),
            "highest" => query.OrderByDescending(r => r.Rating).ThenByDescending(r => r.Created),
            "lowest" => query.OrderBy(r => r.Rating).ThenByDescending(r => r.Created),
            _ => query.OrderByDescending(r => r.Created) // Default: newest
        };

        var ratings = await query
            .Select(r => new RatingCourseWithUserDto
            {
                Id = r.Id,
                CourseId = r.CourseId,
                UserId = r.UserId,
                Rating = r.Rating,
                Review = r.Review ?? string.Empty,
                Created = r.Created,
                LastModified = r.LastModified,
                RatingResponse = r.RatingResponse != null ? new RatingResponseDto
                {
                    Id = r.RatingResponse.Id,
                    ResponseText = r.RatingResponse.ResponseText,
                    RespondedBy = r.RatingResponse.CreatedBy,
                    RespondedAt = r.RatingResponse.Created
                } : null
            })
            .PaginatedListAsync(request.PageNumber, request.PageSize);

        // Batch fetch student and instructor details to avoid N+1 query loops
        var userIds = ratings.Items.Select(r => r.UserId)
            .Union(ratings.Items.Where(r => r.RatingResponse != null).Select(r => r.RatingResponse!.RespondedBy))
            .Distinct()
            .ToList();

        var users = await _identityService.GetUserIdentitiesByIdsAsync(userIds, cancellationToken);
        var userCache = users.ToDictionary(u => u.Id, u => (u.FullName, u.Avatar));

        foreach (var rating in ratings.Items)
        {
            if (userCache.TryGetValue(rating.UserId, out var studentInfo))
            {
                rating.UserFullName = studentInfo.FullName;
                rating.UserAvatar = studentInfo.Avatar;
            }

            if (rating.RatingResponse != null && userCache.TryGetValue(rating.RatingResponse.RespondedBy, out var instructorInfo))
            {
                rating.RatingResponse.InstructorFullName = instructorInfo.FullName;
                rating.RatingResponse.InstructorAvatar = instructorInfo.Avatar;
            }
        }

        return ratings;
    }
}
