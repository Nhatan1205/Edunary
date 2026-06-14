using System.Threading;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Events.Courses;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Edunary.Application.Courses.EventHandlers;

public class CourseSubmittedEventHandler : INotificationHandler<CourseSubmittedEvent>
{
    private readonly ILogger<CourseSubmittedEventHandler> _logger;
    private readonly ICourseCurriculumEmbeddingJobService _curriculumEmbeddingJobService;

    public CourseSubmittedEventHandler(
        ILogger<CourseSubmittedEventHandler> logger,
        ICourseCurriculumEmbeddingJobService curriculumEmbeddingJobService)
    {
        _logger = logger;
        _curriculumEmbeddingJobService = curriculumEmbeddingJobService;
    }

    public Task Handle(CourseSubmittedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Edunary Domain Event: {DomainEvent}", notification.GetType().Name);

        var courseId = notification.Item.Id;

        // Enqueue curriculum embedding when course is submitted for review
        _curriculumEmbeddingJobService.EnqueueCurriculumEmbedding(courseId);

        return Task.CompletedTask;
    }
}
