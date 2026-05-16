using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;
using Edunary.Application.Common.Models;
using Microsoft.EntityFrameworkCore;
using MediatR;

namespace Edunary.Application.VideoCaptions.Commands.GenerateAICaption;

public record GenerateAICaptionCommand : IRequest<Result>
{
    public int MediaFileId { get; init; }
    public int? TargetLanguage { get; init; }
}

public class GenerateAICaptionCommandHandler : IRequestHandler<GenerateAICaptionCommand, Result>
{
    private readonly ICaptionGenerationJobService _captionJobService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;
    private readonly ICourseAuthorizationService _courseAuth;

    public GenerateAICaptionCommandHandler(
        ICaptionGenerationJobService captionJobService,
        ICurrentUserService currentUserService,
        IApplicationDbContext context,
        ICourseAuthorizationService courseAuth)
    {
        _captionJobService = captionJobService;
        _currentUserService = currentUserService;
        _context = context;
        _courseAuth = courseAuth;
    }

    public async Task<Result> Handle(GenerateAICaptionCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;
        if (string.IsNullOrEmpty(userId))
            return Result.Failure("User is not authenticated.");

        var courseId = await _context.MediaFiles
            .Where(m => m.Id == request.MediaFileId)
            .Select(m => m.CourseId)
            .FirstOrDefaultAsync(cancellationToken);

        if (courseId.HasValue)
        {
            bool canManage = await _courseAuth.HasCourseAccessAsync(courseId.Value, userId, CoursePermission.Manage, cancellationToken);
            if (!canManage)
                return Result.Failure("You do not have permission to manage captions for this course.");
        }

        _captionJobService.EnqueueCaptionGeneration(userId, request.MediaFileId, request.TargetLanguage);
        return Result.Success();
    }
}
