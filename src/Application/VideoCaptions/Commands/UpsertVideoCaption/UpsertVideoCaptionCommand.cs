using MediatR;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.VideoCaptions.Commands.UpsertVideoCaption;

public record UpsertVideoCaptionCommand : IRequest<Result>
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

public class UpsertVideoCaptionCommandHandler : IRequestHandler<UpsertVideoCaptionCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IUploadFileService _uploadFileService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public UpsertVideoCaptionCommandHandler(
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

    public async Task<Result> Handle(UpsertVideoCaptionCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        var language = (Languages)request.Language;

        // Resolve courseId from MediaFile to check Manage permission
        var courseId = await _context.MediaFiles
            .Where(m => m.Id == request.MediaFileId)
            .Select(m => m.CourseId)
            .FirstOrDefaultAsync(cancellationToken);

        if (courseId.HasValue)
        {
            bool canManage = await _courseAuth.HasCourseAccessAsync(courseId.Value, userId, CoursePermission.Manage, cancellationToken);
            if (!canManage)
            {
                return Result.Failure("You do not have permission to manage captions for this course.");
            }
        }

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
        {
            return Result.Failure("Failed to upload caption file to storage.");
        }

        if (existing != null)
        {
            existing.FileName = request.FileName;
            existing.FileUrl = fileUrl;
            existing.FileSize = request.FileSize;
            existing.Status = CaptionStatus.COMPLETED;

            await _context.SaveChangesAsync(cancellationToken);
            return Result.Success();
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
            return Result.Success();
        }
    }
}
