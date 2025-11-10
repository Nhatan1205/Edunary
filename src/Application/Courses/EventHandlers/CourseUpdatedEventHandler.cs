using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Events.Courses;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Edunary.Application.Courses.EventHandlers;
public class CourseUpdatedEventHandler : INotificationHandler<CourseUpdatedEvent>
{
    private readonly ILogger<CourseUpdatedEventHandler> _logger;
    private readonly ISearchService _searchService;


    public CourseUpdatedEventHandler(ILogger<CourseUpdatedEventHandler> logger, ISearchService searchService)
    {
        _logger = logger;
        _searchService = searchService;
    }

    public async Task Handle(CourseUpdatedEvent entity, CancellationToken cancellationToken)
    {
        //save index to algolia
        var objectId = $"{entity.Item.CreatedBy}-{entity.Item.Id}";
        var courseObject = new Dictionary<string, object>
        {
            { "objectID", objectId },
            { "Id", entity.Item.Id },
            { "Title", entity.Item.Title },
            { "Subtitle", entity.Item.Subtitle },
            { "Topic", entity.Item.Topic },
            { "Price", entity.Item.Price },
            { "CategoryId", entity.Item.CategoryId },
            { "ImageUrl", entity.Item.ImageUrl }
        };

        await _searchService.IndexAsync("courses", courseObject);
    }
}
