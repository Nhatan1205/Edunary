using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.RatingCourses.Commands.UpsertRatingCourseCommand;

public record UpsertRatingCourseCommand : IRequest<Result>
{
    public int CourseId { get; init; }
    public string UserId { get; init; } = null!;
    public int Rating { get; init; }
    public string Review { get; init; } = string.Empty;
}

public class UpsertRatingCourseCommandHandler : IRequestHandler<UpsertRatingCourseCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;

    public UpsertRatingCourseCommandHandler(IApplicationDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(UpsertRatingCourseCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Verify course exists
            var courseExists = await _context.Courses
                .AnyAsync(c => c.Id == request.CourseId, cancellationToken);

            if (!courseExists)
            {
                return Result.Failure("Course not found");
            }

            // Check if rating already exists for this user and course
            var existingRating = await _context.RatingCourses
                .FirstOrDefaultAsync(r => r.CourseId == request.CourseId && r.UserId == request.UserId, 
                    cancellationToken);

            if (existingRating != null)
            {
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
                    UserId = request.UserId,
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
