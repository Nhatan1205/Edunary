using Edunary.Application.Common.Interfaces;
using Edunary.Application.CourseProgresses.Commands.SyncCourseProgressCommand;
using Edunary.Domain.Entities;
using Edunary.Domain.Events.Courses;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Edunary.Application.Courses.EventHandlers;
public class CourseUpdatedEventHandler : INotificationHandler<CourseUpdatedEvent>
{
    private readonly ILogger<CourseUpdatedEventHandler> _logger;
    private readonly ISender _sender;

    public CourseUpdatedEventHandler(ILogger<CourseUpdatedEventHandler> logger, ISender sender)
    {
        _logger = logger;
        _sender = sender;
    }

    public async Task Handle(CourseUpdatedEvent entity, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Edunary Domain Event: {DomainEvent}", entity.GetType().Name);

        await _sender.Send(new SyncCourseProgressCommand
        {
            CourseId = entity.Item.Id,
            NewContentJson = entity.Item.Content ?? string.Empty
        }, cancellationToken);
    }
}
