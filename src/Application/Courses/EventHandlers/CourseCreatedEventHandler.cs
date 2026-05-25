using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Events.Courses;
using Microsoft.Extensions.Logging;

namespace Edunary.Application.Courses.EventHandlers;

public class CourseCreatedEventHandler : INotificationHandler<CourseCreatedEvent>
{
    private readonly ILogger<CourseCreatedEventHandler> _logger;
    private readonly ICourseEmbeddingJobService _embeddingJobService;

    public CourseCreatedEventHandler(
        ILogger<CourseCreatedEventHandler> logger,
        ICourseEmbeddingJobService embeddingJobService)
    {
        _logger = logger;
        _embeddingJobService = embeddingJobService;
    }

    public Task Handle(CourseCreatedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Edunary Domain Event: {DomainEvent}", notification.GetType().Name);

        // Enqueue embedding job. The job service will skip if status is not Public.
        //_embeddingJobService.EnqueueCourseEmbedding(notification.Item.Id);

        return Task.CompletedTask;
    }
}
