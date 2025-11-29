using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.RatingCourses.Queries.GetRatingCourseByUserQuery;

public class GetRatingCourseByUserQuery : IRequest<Result>
{
    public int CourseId { get; init; }
}

public class GetRatingCourseByUserQueryHandler : IRequestHandler<GetRatingCourseByUserQuery, Result>
{
    private readonly IApplicationDbContext _context;

    private readonly ICurrentUserService _currentUserService;

    public GetRatingCourseByUserQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(GetRatingCourseByUserQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(userId))
            {
                return Result.Failure("User not authenticated");
            }

            // Verify course exists
            var rating = await _context.RatingCourses
                .Where(r => r.CourseId == request.CourseId && r.UserId == userId)
                .Select(r => new RatingCourseDto
                {
                    Id = r.Id,
                    CourseId = r.CourseId,
                    Rating = r.Rating,
                    Review = r.Review,
                    LastModified = r.LastModified
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (rating == null)
            {
                return Result.Success(null, "No rating found for this user and course");
            }

            return Result.Success(rating);
        }
        catch (Exception ex)
        {
            return Result.Failure($"An error occurred while fetching rating: {ex.Message}");
        }
    }
}
