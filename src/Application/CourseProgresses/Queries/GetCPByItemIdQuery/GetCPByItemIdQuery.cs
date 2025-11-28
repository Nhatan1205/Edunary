using System.Text.Json;
using System.Text.Json.Serialization;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.CourseProgresses.Commands.UpdateCourseProgressCommand;

namespace Edunary.Application.CourseProgresses.Queries.GetCPByItemIdQuery;

public class GetCPByItemIdQuery : IRequest<CourseItemDto>
{
    public string ItemId { get; init; }
    public int CourseId { get; init; }
}
public class GetCPByItemIdQueryHandler : IRequestHandler<GetCPByItemIdQuery, CourseItemDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetCPByItemIdQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<CourseItemDto> Handle(GetCPByItemIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        var courseProgress = await _context.CourseProgress
            .AsNoTracking() 
            .FirstOrDefaultAsync(cp => cp.CourseId == request.CourseId && cp.StudentId == userId, cancellationToken);
        if (courseProgress != null && !string.IsNullOrWhiteSpace(courseProgress.Progress))
        {
            var options = new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true 
            };
            var progressObj = JsonSerializer.Deserialize<CourseContentSchema>(courseProgress.Progress, options);
            var allItems = progressObj.Contents
                .SelectMany(section => section.Items)
                .ToList();
            var currentIndex = allItems.FindIndex(x => x.ItemId == request.ItemId);
            if (currentIndex == -1) return null;
            var currentItemData = allItems[currentIndex];
            var prevItemData = currentIndex > 0 ? allItems[currentIndex - 1] : null;
            var nextItemData = currentIndex < allItems.Count - 1 ? allItems[currentIndex + 1] : null;
            var result = new CourseItemDto
            {
                CurrentItem = new ItemDetailDto
                {
                    ItemId = currentItemData.ItemId,
                    Title = currentItemData.Title,
                    Description = currentItemData.Description,
                    Content = currentItemData.Content,
                    ContentType = currentItemData.ContentType,
                    Type = currentItemData.Type,
                    LastPosition = currentItemData.LastPosition,
                    IsCompleted = currentItemData.IsCompleted
                },
                Navigation = new NavigationDto
                {
                    Prev = prevItemData != null ? new NavItemDto
                    {
                        ItemId = prevItemData.ItemId,
                        Title = prevItemData.Title,
                        Type = prevItemData.Type
                    } : null,
                    Next = nextItemData != null ? new NavItemDto
                    {
                        ItemId = nextItemData.ItemId,
                        Title = nextItemData.Title,
                        Type = nextItemData.Type
                    } : null
                }
            };
            return result;
        }
        return null;
    }
}