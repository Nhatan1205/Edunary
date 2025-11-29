using System.Text.Json;
using System.Text.Json.Serialization;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.CourseProgresses.Commands.UpdateCourseProgressCommand;

namespace Edunary.Application.CourseProgresses.Queries.GetLastAccessedItemQuery;

public class GetLastAccessedItemQuery : IRequest<LastAccessedItemDto>
{
    public int CourseId { get; init; }
}
public class GetLastAccessedItemQueryHandler : IRequestHandler<GetLastAccessedItemQuery, LastAccessedItemDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetLastAccessedItemQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<LastAccessedItemDto> Handle(GetLastAccessedItemQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        var courseProgress = await _context.CourseProgress
            .AsNoTracking()
            .FirstOrDefaultAsync(cp => cp.CourseId == request.CourseId && cp.StudentId == userId, cancellationToken);
        if (courseProgress == null || string.IsNullOrWhiteSpace(courseProgress.Progress))
        {
             return null; 
        }
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var progressObj = JsonSerializer.Deserialize<CourseContentSchema>(courseProgress.Progress, options);
        var allItems = progressObj.Contents.SelectMany(c => c.Items).ToList();
        if (!allItems.Any()) return null;
        var targetId = progressObj.LastAccessedItemId;
        var targetItem = allItems.FirstOrDefault(i => i.ItemId == targetId);
        if (targetItem == null)
        {
            targetItem = allItems.First();
        }

        return new LastAccessedItemDto
        {
            ItemId = targetItem.ItemId,
            RouteType = targetItem.Type?.ToLower() == "quiz" ? "quiz" : "lecture"
        };
    }
}
