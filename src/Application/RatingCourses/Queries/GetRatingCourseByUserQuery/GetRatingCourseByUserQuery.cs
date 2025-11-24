using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.RatingCourses.Queries.GetRatingCourseByUserQuery;

public record GetRatingCourseByUserQuery : IRequest<Result>
{
    public int CourseId { get; init; }
    public string UserId { get; init; } = null!;
}

public class GetRatingCourseByUserQueryHandler : IRequestHandler<GetRatingCourseByUserQuery, Result>
{
    private readonly IApplicationDbContext _context;

    public GetRatingCourseByUserQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(GetRatingCourseByUserQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var rating = await _context.RatingCourses
                .Where(r => r.CourseId == request.CourseId && r.UserId == request.UserId)
                .Select(r => new RatingCourseDto
                {
                    Id = r.Id,
                    CourseId = r.CourseId,
                    UserId = r.UserId,
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
