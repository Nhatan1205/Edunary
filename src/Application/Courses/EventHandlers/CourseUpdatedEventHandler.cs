using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Events;
using Edunary.Domain.Events.Courses;
using Microsoft.Extensions.Logging;

namespace Edunary.Application.Courses.EventHandlers;
public class CourseUpdatedEventHandler : INotificationHandler<CourseUpdatedEvent>
{
    private readonly ILogger<CourseUpdatedEventHandler> _logger;
    private readonly INotifyService _notifyService;

    public CourseUpdatedEventHandler(ILogger<CourseUpdatedEventHandler> logger, INotifyService notifyService)
    {
        _logger = logger;
        _notifyService = notifyService;
    }

    public async Task Handle(CourseUpdatedEvent notification, CancellationToken cancellationToken)
    {
        await _notifyService.SendMessage("Server", "The Course have been updated");
        _logger.LogInformation("Edunary Domain Event: {DomainEvent}", notification.GetType().Name);
    }
}
