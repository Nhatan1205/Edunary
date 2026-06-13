using Edunary.Application.Common.Interfaces;
using Edunary.Application.CourseProgresses.Commands.SyncCourseProgressCommand;
using Edunary.Domain.Events.Courses;
using MediatR;
using Microsoft.Extensions.Logging;
using Edunary.Domain.Enums;

namespace Edunary.Application.Courses.EventHandlers;

public class CourseUpdatedEventHandler : INotificationHandler<CourseUpdatedEvent>
{
    private readonly ILogger<CourseUpdatedEventHandler> _logger;
    private readonly ISender _sender;
    private readonly ICourseEmbeddingJobService _embeddingJobService;
    private readonly ICourseCurriculumEmbeddingJobService _curriculumEmbeddingJobService;

    public CourseUpdatedEventHandler(
        ILogger<CourseUpdatedEventHandler> logger,
        ISender sender,
        ICourseEmbeddingJobService embeddingJobService,
        ICourseCurriculumEmbeddingJobService curriculumEmbeddingJobService)
    {
        _logger = logger;
        _sender = sender;
        _embeddingJobService = embeddingJobService;
        _curriculumEmbeddingJobService = curriculumEmbeddingJobService;
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

        if (entity.Item.Status == CourseStatus.Public)
        {
            _embeddingJobService.EnqueueCourseEmbedding(entity.Item.Id);
            _curriculumEmbeddingJobService.EnqueueCurriculumEmbedding(entity.Item.Id);
        }
    }
}
