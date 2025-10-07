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
    public int? Level { get; init; }
    public int? Status { get; init; }
    public string? Topic { get; init; }

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
            entity.Title = request.Title;
            entity.Subtitle = request.Subtitle;
            entity.Description = request.Description;
                        entity.Topic = request.Topic;
                entity.LearningObjectives = request.LearningObjectives;
                entity.Requirements = request.Requirements;
                entity.TargetAudience = request.TargetAudience;
                entity.ImageUrl = request.ImageUrl;
                entity.WelcomeMessage = request.WelcomeMessage;
                entity.CongratulationsMessage = request.CongratulationsMessage;
            if (request.Price.HasValue)
            {
                entity.Price = request.Price.Value;
            }
            if (request.CategoryId.HasValue)
            {
                entity.CategoryId = request.CategoryId.Value;
            }
            if (request.Level.HasValue)
            {
                entity.Level = (CourseLevel)request.Level.Value;
            }
            if (request.Status.HasValue)
            {
                entity.Status = (CourseStatus)request.Status.Value;
            }
    

            entity.AddDomainEvent(new CourseUpdatedEvent(entity));

            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success("Course updated successfully");


        }
        catch (Exception ex)
        {
            return Result.Failure($"An unexpected error occurred while updating course: {ex.Message}");
        }

    }
}
