using System.Text.Json;
using System.Text.Json.Serialization;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.CourseProgresses.Commands.UpdateCourseProgressCommand;

namespace Edunary.Application.CourseProgresses.Commands.UpdateCPByItemIdCommand;

public class UpdateCPByItemIdCommand : IRequest<Result>
{
    public int CourseId { get; init; }
    public string ItemId { get; init; }
    public bool IsCompleted { get; init; }
    public double? LastPosition { get; init; }
}
public class UpdateCPByItemIdCommandHandler : IRequestHandler<UpdateCPByItemIdCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseProgressCacheService _cacheService;

    public UpdateCPByItemIdCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseProgressCacheService cacheService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _cacheService = cacheService;
    }

    public async Task<Result> Handle(UpdateCPByItemIdCommand request, CancellationToken cancellationToken)
    {
        string userId = _currentUserService.UserId;

        if (request.LastPosition.HasValue && !request.IsCompleted)
        {
            await _cacheService.CachePositionAsync(
                userId, request.CourseId, request.ItemId,
                request.LastPosition.Value, cancellationToken);
            return Result.Success();
        }

        var readOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var writeOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var courseProgress = await _context.CourseProgress
            .FirstOrDefaultAsync(cp => cp.CourseId == request.CourseId && cp.StudentId == userId, cancellationToken);

        if (courseProgress == null)
        {
            return Result.Failure(new[] { "Course progress not found." });
        }

        var progressData = JsonSerializer.Deserialize<CourseContentSchema>(courseProgress.Progress, readOptions);
        foreach (SectionSchema section in progressData.Contents)
        {
            if (section.Items == null) continue;
            ItemSchema targetItem = section.Items.FirstOrDefault(i => i.ItemId == request.ItemId);
            if (targetItem != null)
            {
#nullable enable
                CachedProgressPositionData? cached = await _cacheService.GetCachedPositionAsync(
                    userId, request.CourseId, request.ItemId, cancellationToken);
#nullable disable
                if (cached != null)
                {
                    targetItem.LastPosition = cached.LastPosition;
                }
                else if (request.LastPosition.HasValue)
                {
                    targetItem.LastPosition = request.LastPosition.Value;
                }

                if (!targetItem.IsCompleted)
                {
                    targetItem.IsCompleted = request.IsCompleted;
                }
                break;
            }
        }

        progressData.LastAccessedItemId = request.ItemId;
        courseProgress.Progress = JsonSerializer.Serialize(progressData, writeOptions);
        await _context.SaveChangesAsync(cancellationToken);

        await _cacheService.RemoveSingleEntryAsync(userId, request.CourseId, request.ItemId, cancellationToken);

        return Result.Success();
    }
}