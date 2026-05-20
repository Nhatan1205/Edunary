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
    private readonly IIdentityService _identityService;

    public GetRatingCourseByUserQueryHandler(
        IApplicationDbContext context, 
        ICurrentUserService currentUserService,
        IIdentityService identityService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _identityService = identityService;
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

            var rating = await _context.RatingCourses
                .Include(r => r.RatingResponse)
                .Where(r => r.CourseId == request.CourseId && r.UserId == userId)
                .FirstOrDefaultAsync(cancellationToken);

            if (rating == null)
            {
                return Result.Success(null, "No rating found for this user and course");
            }

            var dto = new RatingCourseDto
            {
                Id = rating.Id,
                CourseId = rating.CourseId,
                Rating = rating.Rating,
                Review = rating.Review ?? string.Empty,
                LastModified = rating.LastModified
            };

            if (rating.RatingResponse != null)
            {
                dto.RatingResponse = new RatingResponseDto
                {
                    Id = rating.RatingResponse.Id,
                    ResponseText = rating.RatingResponse.ResponseText,
                    RespondedBy = rating.RatingResponse.CreatedBy,
                    RespondedAt = rating.RatingResponse.Created
                };

                // Fetch instructor details
                var instructorUsers = await _identityService.GetUserIdentitiesByIdsAsync(
                    new List<string> { rating.RatingResponse.CreatedBy }, 
                    cancellationToken
                );
                var instructor = instructorUsers.FirstOrDefault();
                if (instructor != null)
                {
                    dto.RatingResponse.InstructorFullName = instructor.FullName;
                    dto.RatingResponse.InstructorAvatar = instructor.Avatar;
                }
            }

            return Result.Success(dto);
        }
        catch (Exception ex)
        {
            return Result.Failure($"An error occurred while fetching rating: {ex.Message}");
        }
    }
}
