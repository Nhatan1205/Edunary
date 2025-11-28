using System.Text.Json;
using System.Text.Json.Serialization;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.CourseProgresses.Commands.UpdateCourseProgressCommand;

namespace Edunary.Application.CourseProgresses.Commands.SyncCourseProgressCommand;

public class SyncCourseProgressCommand : IRequest<Result>
{
    public int CourseId { get; init; }
    public string NewContentJson { get; init; }
}
public class SyncCourseProgressCommandHandler : IRequestHandler<SyncCourseProgressCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public SyncCourseProgressCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(SyncCourseProgressCommand request, CancellationToken cancellationToken)
    {
        var students = await _context.CourseProgress
            .Where(x => x.CourseId == request.CourseId)
            .ToListAsync(cancellationToken);

        foreach (var student in students)
        {
            var syncedJson = MergeProgress(request.NewContentJson, student.Progress);
            student.Progress = syncedJson;
        }
        var rs =  await _context.SaveChangesAsync(cancellationToken);
        if (rs > 0)
        {
            return Result.Success();
        }
        return Result.Failure("Failed to sync course progress.");
    }

    private string MergeProgress(string newContentJson, string oldProgressJson)
    {
        if (string.IsNullOrEmpty(newContentJson)) return oldProgressJson;
        if (string.IsNullOrEmpty(oldProgressJson)) return newContentJson;

        try
        {
            var options = new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull 
            };

            var newStructure = JsonSerializer.Deserialize<CourseContentSchema>(newContentJson, options);
            var oldProgress = JsonSerializer.Deserialize<CourseContentSchema>(oldProgressJson, options);

            if (newStructure?.Contents == null || oldProgress?.Contents == null) return newContentJson;

            var oldItemsMap = oldProgress.Contents
                .SelectMany(s => s.Items)
                .Where(i => !string.IsNullOrEmpty(i.ItemId))
                .GroupBy(i => i.ItemId)
                .ToDictionary(g => g.Key, g => g.First());
            
            newStructure.LastAccessedItemId = oldProgress.LastAccessedItemId;

            foreach (var section in newStructure.Contents)
            {
                foreach (var item in section.Items)
                {
                    if (oldItemsMap.TryGetValue(item.ItemId, out var oldItem))
                    {
                        item.IsCompleted = oldItem.IsCompleted;
                        if (item.Content == oldItem.Content)
                        {
                            item.LastPosition = oldItem.LastPosition;
                        }
                    }
                    
                }
            }

            return JsonSerializer.Serialize(newStructure, options);
        }
        catch
        {
            return newContentJson; 
        }
    }
}