using Edunary.Application.Common.Behaviours;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.RatingCourses.Commands.UpsertRatingCourseCommand;

[ActivityLog(ActivityType.RateCourse, "Rate Course")]
public class UpsertRatingCourseCommand : IRequest<Result>
{
    public int CourseId { get; init; }
    public int Rating { get; init; }
    public string Review { get; init; } = string.Empty;
}

public class UpsertRatingCourseCommandHandler : IRequestHandler<UpsertRatingCourseCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly ICurrentUserService _currentUserService;

    public UpsertRatingCourseCommandHandler(IApplicationDbContext context, IUser currentUser, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUser = currentUser;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(UpsertRatingCourseCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(userId))
            {
                return Result.Failure("User not authenticated");
            }

            // Verify course exists
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == request.CourseId, cancellationToken);

            if (course == null)
            {
                return Result.Failure("Course not found");
            }

            // Check if user is enrolled in the course
            var hasEnrollment = await _context.Enrollments
                .AnyAsync(e => e.CourseId == request.CourseId && e.StudentId == userId, 
                    cancellationToken);

            if (!hasEnrollment)
            {
                return Result.Failure("You must be enrolled in this course to rate it");
            }

            // Check if rating already exists for this user and course
            var existingRating = await _context.RatingCourses
                .Include(r => r.RatingResponse)
                .FirstOrDefaultAsync(r => r.CourseId == request.CourseId && r.UserId == userId, 
                    cancellationToken);
            
            // Update course ratings
            int oldUserRating = existingRating != null ? existingRating.Rating : 0;
            int newUserRating = request.Rating;
            course.UpdateRatings(oldUserRating, newUserRating);

            // Save changes to course ratings
            if (existingRating != null)
            {
                // Delete instructor response if student edits rating
                if (existingRating.RatingResponse != null)
                {
                    _context.RatingResponses.Remove(existingRating.RatingResponse);
                }

                // Update existing rating
                existingRating.Rating = request.Rating;
                existingRating.Review = request.Review;

                await _context.SaveChangesAsync(cancellationToken);
                return Result.Success("Rating updated successfully");
            }
            else
            {
                // Create new rating
                var newRating = new RatingCourse
                {
                    CourseId = request.CourseId,
                    UserId = userId,
                    Rating = request.Rating,
                    Review = request.Review
                };

                _context.RatingCourses.Add(newRating);
                await _context.SaveChangesAsync(cancellationToken);
                return Result.Success("Rating created successfully");
            }
        }
        catch (Exception ex)
        {
            return Result.Failure($"An unexpected error occurred while saving rating: {ex.Message}");
        }
    }
}
