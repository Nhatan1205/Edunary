using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Edunary.Application.TodoItems.EventHandlers;
using Edunary.Domain.Events;
using Microsoft.Extensions.Logging;

namespace Edunary.Application.Courses.EventHandlers;
public class CourseCreatedEventHandler
{
    private readonly ILogger<CourseCreatedEventHandler> _logger;

    public CourseCreatedEventHandler(ILogger<CourseCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CourseCreatedEventHandler notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Edunary Domain Event: {DomainEvent}", notification.GetType().Name);

        return Task.CompletedTask;
    }
}
