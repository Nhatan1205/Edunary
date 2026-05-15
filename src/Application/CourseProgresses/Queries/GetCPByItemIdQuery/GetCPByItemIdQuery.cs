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
    private readonly ICourseProgressCacheService _cacheService;

    public GetCPByItemIdQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseProgressCacheService cacheService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _cacheService = cacheService;
    }

    public async Task<CourseItemDto> Handle(GetCPByItemIdQuery request, CancellationToken cancellationToken)
    {
        string userId = _currentUserService.UserId;
        var courseProgress = await _context.CourseProgress
            .AsNoTracking()
            .FirstOrDefaultAsync(cp => cp.CourseId == request.CourseId && cp.StudentId == userId, cancellationToken);

        if (courseProgress == null || string.IsNullOrWhiteSpace(courseProgress.Progress))
        {
            return null;
        }

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var progressObj = JsonSerializer.Deserialize<CourseContentSchema>(courseProgress.Progress, options);
        var allItems = progressObj.Contents
            .SelectMany(section => section.Items)
            .ToList();

        int currentIndex = allItems.FindIndex(x => x.ItemId == request.ItemId);
        if (currentIndex == -1) return null;

        ItemSchema currentItemData = allItems[currentIndex];
        ItemSchema prevItemData = currentIndex > 0 ? allItems[currentIndex - 1] : null;
        ItemSchema nextItemData = currentIndex < allItems.Count - 1 ? allItems[currentIndex + 1] : null;

#nullable enable
        CachedProgressPositionData? cached = await _cacheService.GetCachedPositionAsync(
            userId, request.CourseId, request.ItemId, cancellationToken);
#nullable disable

        double lastPosition = cached != null ? cached.LastPosition : currentItemData.LastPosition;

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
                VideoId = currentItemData.VideoId,
                LastPosition = lastPosition,
                IsCompleted = currentItemData.IsCompleted,
                Downloadable = currentItemData.Downloadable
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
}