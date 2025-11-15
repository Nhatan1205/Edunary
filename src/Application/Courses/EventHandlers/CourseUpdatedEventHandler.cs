using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Entities;
using Edunary.Domain.Events.Courses;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Edunary.Application.Courses.EventHandlers;
public class CourseUpdatedEventHandler : INotificationHandler<CourseUpdatedEvent>
{
    private readonly ILogger<CourseUpdatedEventHandler> _logger;


    public CourseUpdatedEventHandler(ILogger<CourseUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CourseUpdatedEvent entity, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Edunary Domain Event: {DomainEvent}", entity.GetType().Name);

        return Task.CompletedTask;
    }
}
