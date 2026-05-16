using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.VideoCaptions.Commands.DeleteVideoCaption;

public class DeleteVideoCaptionCommand : IRequest<Result>
{
    public int CaptionId { get; set; }
}

public class DeleteVideoCaptionCommandHandler : IRequestHandler<DeleteVideoCaptionCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IUploadFileService _uploadFileService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public DeleteVideoCaptionCommandHandler(
        IApplicationDbContext context,
        IUploadFileService uploadFileService,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _uploadFileService = uploadFileService;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<Result> Handle(DeleteVideoCaptionCommand request, CancellationToken cancellationToken)
    {
        var caption = await _context.VideoCaptions
            .FindAsync(new object[] { request.CaptionId }, cancellationToken);

        if (caption == null)
            return Result.Failure($"VideoCaption with id {request.CaptionId} not found.");

        // Check Manage permission via MediaFile → CourseId
        var courseId = await _context.MediaFiles
            .Where(m => m.Id == caption.MediaFileId)
            .Select(m => m.CourseId)
            .FirstOrDefaultAsync(cancellationToken);

        var userId = _currentUserService.UserId;
        if (courseId.HasValue)
        {
            bool canManage = await _courseAuth.HasCourseAccessAsync(courseId.Value, userId, CoursePermission.Manage, cancellationToken);
            if (!canManage)
                return Result.Failure("You do not have permission to manage captions for this course.");
        }

        var s3Key = $"courses/{userId}/captions/{caption.MediaFileId}_{(int)caption.Language}.vtt";

        await _uploadFileService.DeleteObjectByKeyAsync(s3Key);

        _context.VideoCaptions.Remove(caption);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
