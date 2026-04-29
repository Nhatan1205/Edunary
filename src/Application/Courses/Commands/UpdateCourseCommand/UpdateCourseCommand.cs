namespace Edunary.Application.Courses.Commands.UpdateCourse;

using System.Text.Json;
using Edunary.Application.Common.Behaviours;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using Edunary.Domain.Events.Courses;

[ActivityLog(ActivityType.UpdateCourse, "Updated a course")]
public class UpdateCourseCommand : IRequest<Result>
{
    public int Id { get; init; }
    public string Title { get; init; }
    public string Subtitle { get; init; }
    public string Description { get; init; }
    public int Level { get; init; }
    public int Status { get; init; }
    public List<int> TopicIds { get; init; } = new();
    public List<string> LearningObjectives { get; init; }
    public List<string> Requirements { get; init; }
    public List<string> TargetAudience { get; init; }
    public string ImageUrl { get; init; }
    public string WelcomeMessage { get; init; }
    public string CongratulationsMessage { get; init; }
    public float Price { get; init; }
    public int CategoryId { get; init; }
    public string Content { get; init; }
}

public class UpdateCourseCommandHandler : IRequestHandler<UpdateCourseCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly INotifyService _notifyService;
    private readonly IUploadFileService _uploadFileService;
    public UpdateCourseCommandHandler(
        IApplicationDbContext context, 
        ICurrentUserService currentUserService,
        INotifyService notifyService,
        IUploadFileService uploadFileService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _notifyService = notifyService;
        _uploadFileService = uploadFileService;
    }
    public async Task<Result> Handle(UpdateCourseCommand request, CancellationToken cancellationToken)
    {
        try
        {
            
            var entity = await _context.Courses
                .Include(c => c.Topics)
                .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
            Guard.Against.NotFound(request.Id, entity);

            var userId = _currentUserService?.UserId;
            if (entity.CreatedBy != userId)
            {
                return Result.Failure("You are not authorized to update this course.");
            }
            entity.Title = request.Title;
            entity.Subtitle = request.Subtitle;
            entity.Description = request.Description;
            // Sync N:N topics
            var newTopics = await _context.Topics
                .Where(t => request.TopicIds.Contains(t.Id))
                .ToListAsync(cancellationToken);
            entity.Topics.Clear();
            foreach (var topic in newTopics)
                entity.Topics.Add(topic);
            entity.LearningObjectives = JsonSerializer.Serialize(request.LearningObjectives);
            entity.Requirements = JsonSerializer.Serialize(request.Requirements);
            entity.TargetAudience = JsonSerializer.Serialize(request.TargetAudience);
            entity.WelcomeMessage = request.WelcomeMessage;
            entity.CongratulationsMessage = request.CongratulationsMessage;
            entity.Price = request.Price;
            entity.CategoryId = request.CategoryId;
            entity.Level = (CourseLevel)request.Level;
            entity.Status = (CourseStatus)request.Status;
            entity.Content = request.Content;
            if(!string.IsNullOrEmpty(request.ImageUrl) && entity.ImageUrl != request.ImageUrl)
            {
                var imgId = $"{userId}-{request.Id}-{entity.Title}";
                var imageLink = await _uploadFileService.UploadImageToCloudinary(request.ImageUrl, imgId);
                entity.ImageUrl = imageLink;
            }

            entity.AddDomainEvent(new CourseUpdatedEvent(entity));
            var result = await _context.SaveChangesAsync(cancellationToken);
            if (result > 0)
            {
                var notification = new NotificationRequest
                {
                    ImageUrl = entity.ImageUrl,
                    CourseId = entity.Id,
                    Title = $"Update the course {entity.Title}",
                    Subject = $"Update the course {entity.Title}",
                    Message = $"The course {entity.Title} has just been updated.",
                    Type = "course_updated",
                    Url = $"/courses/{entity.Id}"
                };
                await _notifyService.NotifyCourseUpdated(notification, cancellationToken);
            }
            


            return Result.Success("Course updated successfully");


        }
        catch (Exception ex)
        {
            return Result.Failure($"An unexpected error occurred while updating course: {ex.Message}");
        }

    }
}
