using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.VideoCaptions.Commands.UpsertVideoCaption;

public record UpsertVideoCaptionCommand : IRequest<int>
{
    public int MediaFileId { get; init; }
    public int Language { get; init; }
    public Stream FileStream { get; init; }
    public string FileName { get; init; }
    public long FileSize { get; init; }
}

public class UpsertVideoCaptionCommandValidator : AbstractValidator<UpsertVideoCaptionCommand>
{
    public UpsertVideoCaptionCommandValidator()
    {
        RuleFor(x => x.MediaFileId).GreaterThan(0);
        RuleFor(x => x.FileStream).NotNull();
        RuleFor(x => x.FileName)
            .NotEmpty()
            .Must(name => name.EndsWith(".vtt", StringComparison.OrdinalIgnoreCase))
            .WithMessage("Only .vtt files are allowed.");
    }
}

public class UpsertVideoCaptionCommandHandler : IRequestHandler<UpsertVideoCaptionCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly IUploadFileService _uploadFileService;
    private readonly ICurrentUserService _currentUserService;

    public UpsertVideoCaptionCommandHandler(
        IApplicationDbContext context,
        IUploadFileService uploadFileService,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _uploadFileService = uploadFileService;
        _currentUserService = currentUserService;
    }

    public async Task<int> Handle(UpsertVideoCaptionCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        var language = (Languages)request.Language;

        var s3Key = $"courses/{userId}/captions/{request.MediaFileId}_{request.Language}.vtt";
        var folderPath = $"courses/{userId}/captions";
        var s3FileName = $"{request.MediaFileId}_{request.Language}.vtt";

        var existing = await _context.VideoCaptions
            .FirstOrDefaultAsync(
                vc => vc.MediaFileId == request.MediaFileId && vc.Language == language,
                cancellationToken);

        var fileUrl = await _uploadFileService.UploadFileToSpacesAsync(
            request.FileStream,
            s3FileName,
            "text/vtt",
            folderPath);

        if (fileUrl == null)
            throw new Exception("Failed to upload caption file to storage.");

        if (existing != null)
        {
            existing.FileName = request.FileName;
            existing.FileUrl = fileUrl;
            existing.FileSize = request.FileSize;
            existing.Status = CaptionStatus.COMPLETED;

            await _context.SaveChangesAsync(cancellationToken);
            return existing.Id;
        }
        else
        {
            var caption = new VideoCaption
            {
                MediaFileId = request.MediaFileId,
                Language = language,
                FileName = request.FileName,
                FileUrl = fileUrl,
                FileSize = request.FileSize,
                Status = CaptionStatus.COMPLETED,
            };
            _context.VideoCaptions.Add(caption);
            await _context.SaveChangesAsync(cancellationToken);
            return caption.Id;
        }
    }
}
