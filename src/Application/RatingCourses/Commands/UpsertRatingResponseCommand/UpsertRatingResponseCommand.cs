using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.RatingCourses.Commands.UpsertRatingResponseCommand;

// Command to create or update an instructor rating response
public class UpsertRatingResponseCommand : IRequest<Result>
{
    public int RatingCourseId { get; init; }
    public string ResponseText { get; init; } = string.Empty;
}

// Handler for executing the upsert command
public class UpsertRatingResponseCommandHandler : IRequestHandler<UpsertRatingResponseCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public UpsertRatingResponseCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<Result> Handle(UpsertRatingResponseCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = _currentUserService.UserId;
            if (string.IsNullOrEmpty(userId))
            {
                return Result.Failure("User not authenticated");
            }

            // Find rating course with its existing response
            var ratingCourse = await _context.RatingCourses
                .Include(rc => rc.RatingResponse)
                .FirstOrDefaultAsync(rc => rc.Id == request.RatingCourseId, cancellationToken);

            if (ratingCourse == null)
            {
                return Result.Failure("Review not found");
            }

            // Check if instructor has review management access
            var hasAccess = await _courseAuth.HasCourseAccessAsync(
                ratingCourse.CourseId,
                userId,
                CoursePermission.Reviews,
                cancellationToken);

            if (!hasAccess)
            {
                return Result.Failure("You are not authorized to respond to reviews for this course");
            }

            // Create new response if none exists
            if (ratingCourse.RatingResponse == null)
            {
                var newResponse = new RatingResponse
                {
                    RatingCourseId = request.RatingCourseId,
                    ResponseText = request.ResponseText
                };

                _context.RatingResponses.Add(newResponse);
            }
            // update response
            else
            {
                if (ratingCourse.RatingResponse.CreatedBy != userId)
                {
                    return Result.Failure("You are not authorized to edit this response");
                }

                ratingCourse.RatingResponse.ResponseText = request.ResponseText;
            }

            await _context.SaveChangesAsync(cancellationToken);
            return Result.Success(null, "Response saved successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"An error occurred while saving response: {ex.Message}");
        }
    }
}
