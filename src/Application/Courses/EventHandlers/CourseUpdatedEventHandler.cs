using Edunary.Domain.Events;
using Edunary.Domain.Events.Courses;
using Microsoft.Extensions.Logging;

namespace Edunary.Application.Courses.EventHandlers;
public class CourseUpdatedEventHandler : INotificationHandler<CourseUpdatedEvent>
{
    private readonly ILogger<CourseUpdatedEventHandler> _logger;

    public CourseUpdatedEventHandler(ILogger<CourseUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CourseUpdatedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Edunary Domain Event: {DomainEvent}", notification.GetType().Name);

        return Task.CompletedTask;
    }
}
