namespace Edunary.Application.Courses.Commands.UpdateCourse;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using Edunary.Domain.Events.Courses;
#nullable enable
public class UpdateCourseCommand : IRequest<Result>
{
    public int Id { get; init; }
    public string? Title { get; init; }

    public string? Subtitle { get; init; }

    public string? Description { get; init; }

    public string? LearningObjectives { get; init; }
    public string? Level { get; set; }
    public string? Topic { get; set; }

    public string? Requirements { get; init; }

    public string? TargetAudience { get; init; }

    public string? ImageUrl { get; init; }
    public string? WelcomeMessage { get; init; }
    public string? CongratulationsMessage { get; init; }

    public float? Price { get; init; }

    public int? CategoryId { get; init; }
}

public class UpdateCourseCommandHandler : IRequestHandler<UpdateCourseCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    public UpdateCourseCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }
    public async Task<Result> Handle(UpdateCourseCommand request, CancellationToken cancellationToken)
    {
        try
        {
            
            var entity = await _context.Courses
            .FindAsync(new object[] { request.Id }, cancellationToken);
            Guard.Against.NotFound(request.Id, entity);

            var userId = _currentUserService?.UserId;
            if (entity.CreatedBy != userId)
            {
                return Result.Failure("You are not authorized to update this course.");
            }

            if (!string.IsNullOrEmpty(request.Title))
                entity.Title = request.Title;

            if (!string.IsNullOrEmpty(request.Subtitle))
                entity.Subtitle = request.Subtitle;

            if (!string.IsNullOrEmpty(request.Description))
                entity.Description = request.Description;

            if (request.Price.HasValue)
                entity.Price = request.Price.Value;

            if (request.CategoryId.HasValue)
                entity.CategoryId = request.CategoryId.Value;

            if (!string.IsNullOrEmpty(request.Level))
                entity.Level = Enum.Parse<CourseLevel>(request.Level, true);

            if (!string.IsNullOrEmpty(request.Topic))
                entity.Topic = request.Topic;

            if (!string.IsNullOrEmpty(request.LearningObjectives))
                entity.LearningObjectives = request.LearningObjectives;

            if (!string.IsNullOrEmpty(request.Requirements))
                entity.Requirements = request.Requirements;

            if (!string.IsNullOrEmpty(request.TargetAudience))
                entity.TargetAudience = request.TargetAudience;

            if (!string.IsNullOrEmpty(request.ImageUrl))
                entity.ImageUrl = request.ImageUrl;

            if (!string.IsNullOrEmpty(request.WelcomeMessage))
                entity.WelcomeMessage = request.WelcomeMessage;

            if (!string.IsNullOrEmpty(request.CongratulationsMessage))
                entity.CongratulationsMessage = request.CongratulationsMessage;

            entity.AddDomainEvent(new CourseUpdatedEvent(entity));

            var result = await _context.SaveChangesAsync(cancellationToken);
            if (result > 0)
            {
                return Result.Success("Course updated successfully");
            }
            else return Result.Failure("Course updated unsuccessfully");

        }
        catch (Exception ex)
        {
            return Result.Failure($"An unexpected error occurred while updating course: {ex.Message}");
        }

    }
}
