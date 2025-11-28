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

    public UpdateCPByItemIdCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(UpdateCPByItemIdCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        var courseProgress = await _context.CourseProgress
            .FirstOrDefaultAsync(cp => cp.CourseId == request.CourseId && cp.StudentId == userId, cancellationToken);
        var readOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var writeOptions = new JsonSerializerOptions 
        { 
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull 
        };
        var progressData = JsonSerializer.Deserialize<CourseContentSchema>(courseProgress.Progress, readOptions);
        foreach (var section in progressData.Contents)
        {
            if (section.Items == null) continue;
            var targetItem = section.Items.FirstOrDefault(i => i.ItemId == request.ItemId);
            if (targetItem != null)
            {
                if (request.LastPosition.HasValue)
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
        return Result.Success();
    }
}