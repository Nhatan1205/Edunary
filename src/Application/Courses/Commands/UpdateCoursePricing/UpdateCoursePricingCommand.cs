using System;
using System.Threading;
using System.Threading.Tasks;
using Ardalis.GuardClauses;
using Edunary.Application.Common.Behaviours;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Courses.Commands.UpdateCoursePricing;

[ActivityLog(ActivityType.UpdateCourse, "Updated course pricing")]
public class UpdateCoursePricingCommand : IRequest<Result>
{
    public int CourseId { get; init; }
    public float Price { get; init; }
}

public class UpdateCoursePricingCommandHandler : IRequestHandler<UpdateCoursePricingCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICourseAuthorizationService _courseAuth;
    private readonly ICurrentUserService _currentUserService;

    public UpdateCoursePricingCommandHandler(
        IApplicationDbContext context,
        ICourseAuthorizationService courseAuth,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _courseAuth = courseAuth;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(UpdateCoursePricingCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var entity = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == request.CourseId, cancellationToken);
            Guard.Against.NotFound(request.CourseId, entity);

            var userId = _currentUserService?.UserId;

            // Allow Owners OR Collaborators with Manage permission to edit the course pricing
            if (!await _courseAuth.HasCourseAccessAsync(request.CourseId, userId, CoursePermission.Manage, cancellationToken))
            {
                return Result.Failure("You are not authorized to update this course's pricing.");
            }

            // Check 7-day cooldown only if price actually changes
            if (entity.LastPriceChangedAt.HasValue)
            {
                var daysSinceLastChange = (DateTimeOffset.UtcNow - entity.LastPriceChangedAt.Value).TotalDays;
                if (daysSinceLastChange < 7)
                {
                    var remainingDays = (int)Math.Ceiling(7 - daysSinceLastChange);
                    return Result.Failure($"You can only change the price once every 7 days. Please wait {remainingDays} more day(s) before changing the price again.");
                }
            }

            entity.Price = request.Price;
            entity.LastPriceChangedAt = DateTimeOffset.UtcNow;

            var result = await _context.SaveChangesAsync(cancellationToken);
            if (result > 0)
            {
                return Result.Success("Course pricing updated successfully");
            }

            return Result.Failure("Failed to update course pricing");
        }
        catch (Exception ex)
        {
            return Result.Failure($"An unexpected error occurred while updating course pricing: {ex.Message}");
        }
    }
}
