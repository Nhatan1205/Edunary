using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.RatingCourses.Commands.DeleteRatingResponseCommand;

// Command to delete an instructor response
public class DeleteRatingResponseCommand : IRequest<Result>
{
    public int RatingCourseId { get; init; }
}

// Handler for executing the delete command
public class DeleteRatingResponseCommandHandler : IRequestHandler<DeleteRatingResponseCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public DeleteRatingResponseCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<Result> Handle(DeleteRatingResponseCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = _currentUserService.UserId;
            if (string.IsNullOrEmpty(userId))
            {
                return Result.Failure("User not authenticated");
            }

            var ratingCourse = await _context.RatingCourses
                .Include(rc => rc.RatingResponse)
                .FirstOrDefaultAsync(rc => rc.Id == request.RatingCourseId, cancellationToken);

            if (ratingCourse == null)
            {
                return Result.Failure("Review not found");
            }

            if (ratingCourse.RatingResponse == null)
            {
                return Result.Failure("No response found for this review");
            }

            // Check if instructor has review management access
            var hasAccess = await _courseAuth.HasCourseAccessAsync(
                ratingCourse.CourseId,
                userId,
                CoursePermission.Reviews,
                cancellationToken);

            if (!hasAccess)
            {
                return Result.Failure("You are not authorized to manage reviews for this course");
            }

            if (ratingCourse.RatingResponse.CreatedBy != userId)
            {
                return Result.Failure("You are not authorized to delete this response");
            }

            _context.RatingResponses.Remove(ratingCourse.RatingResponse);
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success(null, "Response deleted successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"An error occurred while deleting response: {ex.Message}");
        }
    }
}
