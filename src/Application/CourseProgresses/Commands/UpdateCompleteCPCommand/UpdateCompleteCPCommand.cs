using System.Text.Json;
using System.Text.Json.Serialization;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.CourseProgresses.Commands.UpdateCourseProgressCommand;


namespace Edunary.Application.CourseProgresses.Commands.UpdateCompleteCPCommand;

public class UpdateCompleteCPCommand : IRequest<Result>
{
    public int CourseId { get; init; }
    public string ItemId { get; init; }
    public bool IsCompleted { get; init; }
}
public class UpdateCompleteCPCommandHandler : IRequestHandler<UpdateCompleteCPCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ISender _sender;

    public UpdateCompleteCPCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ISender sender)
    {
        _context = context;
        _currentUserService = currentUserService;
        _sender = sender;
    }

    public async Task<Result> Handle(UpdateCompleteCPCommand request, CancellationToken cancellationToken)
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
                targetItem.IsCompleted = request.IsCompleted;
                break;
            }
        }
        courseProgress.Progress = JsonSerializer.Serialize(progressData, writeOptions);
        await _context.SaveChangesAsync(cancellationToken);

        if (request.IsCompleted)
        {
            var existingCert = await _context.CourseCertificates
                .AnyAsync(c => c.CourseId == request.CourseId && c.StudentId == userId, cancellationToken);
            if (!existingCert)
            {
                bool allCompleted = true;
                foreach (var s in progressData.Contents)
                {
                    if (s.Items == null) continue;
                    foreach (var i in s.Items)
                    {
                        if ((i.Type == "lecture" || i.Type == "quiz") && !i.IsCompleted)
                        {
                            allCompleted = false;
                            break;
                        }
                    }
                    if (!allCompleted) break;
                }

                if (allCompleted)
                {
                    await _sender.Send(new Edunary.Application.Certificates.Commands.IssueCertificateCommand.IssueCertificateCommand
                    {
                        CourseId = request.CourseId
                    }, cancellationToken);
                }
            }
        }

        return Result.Success();
    }
}
