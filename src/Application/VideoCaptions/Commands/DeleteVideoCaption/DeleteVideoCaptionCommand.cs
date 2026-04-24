
using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Entities;

namespace Edunary.Application.VideoCaptions.Commands.DeleteVideoCaption;

public record DeleteVideoCaptionCommand : IRequest
{
    public int CaptionId { get; init; }
}

public class DeleteVideoCaptionCommandHandler : IRequestHandler<DeleteVideoCaptionCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUploadFileService _uploadFileService;
    private readonly ICurrentUserService _currentUserService;

    public DeleteVideoCaptionCommandHandler(
        IApplicationDbContext context,
        IUploadFileService uploadFileService,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _uploadFileService = uploadFileService;
        _currentUserService = currentUserService;
    }

    public async Task Handle(DeleteVideoCaptionCommand request, CancellationToken cancellationToken)
    {
        var caption = await _context.VideoCaptions
            .FindAsync(new object[] { request.CaptionId }, cancellationToken);

        if (caption == null)
            throw new KeyNotFoundException($"VideoCaption with id {request.CaptionId} not found.");

        var userId = _currentUserService.UserId;
        var s3Key = $"courses/{userId}/captions/{caption.MediaFileId}_{(int)caption.Language}.vtt";

        await _uploadFileService.DeleteObjectByKeyAsync(s3Key);

        _context.VideoCaptions.Remove(caption);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
