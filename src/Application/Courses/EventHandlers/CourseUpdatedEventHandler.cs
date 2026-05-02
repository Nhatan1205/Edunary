using Edunary.Application.Common.Interfaces;
using Edunary.Application.CourseProgresses.Commands.SyncCourseProgressCommand;
using Edunary.Domain.Events.Courses;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Edunary.Application.Courses.EventHandlers;

public class CourseUpdatedEventHandler : INotificationHandler<CourseUpdatedEvent>
{
    private readonly ILogger<CourseUpdatedEventHandler> _logger;
    private readonly ISender _sender;
    private readonly ICourseEmbeddingJobService _embeddingJobService;

    public CourseUpdatedEventHandler(
        ILogger<CourseUpdatedEventHandler> logger,
        ISender sender,
        ICourseEmbeddingJobService embeddingJobService)
    {
        _logger = logger;
        _sender = sender;
        _embeddingJobService = embeddingJobService;
    }

    public async Task Handle(CourseUpdatedEvent entity, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Edunary Domain Event: {DomainEvent}", entity.GetType().Name);

        // 1. Sync course progress with updated content structure
        await _sender.Send(new SyncCourseProgressCommand
        {
            CourseId = entity.Item.Id,
            NewContentJson = entity.Item.Content ?? string.Empty
        }, cancellationToken);

        // 2. Enqueue embedding update (job service handles Public vs Draft logic)
        _embeddingJobService.EnqueueCourseEmbedding(entity.Item.Id);
    }
}
