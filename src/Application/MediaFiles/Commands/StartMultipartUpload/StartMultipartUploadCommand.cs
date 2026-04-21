using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.SystemSettings.Queries.GetSystemSettingValuesQuery;
using Edunary.Domain.Common;
using Edunary.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Edunary.Application.MediaFiles.Commands.StartMultipartUpload;

public class StartMultipartUploadDto
{
    public string FileName { get; set; } = null!;
    public string FileUrl { get; set; } = null!;
    public string UploadId { get; set; } = null!;
    public List<string> PresignedUrls { get; set; } = new List<string>();
}

public class StartMultipartUploadCommand : IRequest<ReturnResult<StartMultipartUploadDto>>
{
    public string FileName { get; set; } = null!;
    public string ContentType { get; set; } = null!;
    public int PartsCount { get; set; }
}

public class StartMultipartUploadCommandHandler : IRequestHandler<StartMultipartUploadCommand, ReturnResult<StartMultipartUploadDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUploadFileService _uploadFileService;
    private readonly IMediator _mediator;
    private readonly DigitalOceanSettings _fallbackDO;

    public StartMultipartUploadCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IUploadFileService uploadFileService,
        IMediator mediator,
        IOptions<DigitalOceanSettings> spacesOptions)
    {
        _context = context;
        _currentUserService = currentUserService;
        _uploadFileService = uploadFileService;
        _mediator = mediator;
        _fallbackDO = spacesOptions.Value;
    }

    public async Task<ReturnResult<StartMultipartUploadDto>> Handle(StartMultipartUploadCommand request, CancellationToken cancellationToken)
    {
        var result = new ReturnResult<StartMultipartUploadDto>();
        var userId = _currentUserService?.UserId;
        var baseFileName = Path.GetFileNameWithoutExtension(request.FileName).Trim();
        var extension = Path.GetExtension(request.FileName);
        var newFileName = request.FileName.Trim();
        var count = 1;

        var existingFileNames = await _context.MediaFiles
            .Where(cc => cc.FileName.StartsWith(baseFileName) && cc.UserId == userId && cc.ContentType == request.ContentType)
            .Select(cc => cc.FileName)
            .ToHashSetAsync(cancellationToken);

        while (existingFileNames.Contains(newFileName))
        {
            newFileName = $"{baseFileName}({count}){extension}";
            count++;
        }

        var (uploadId, presignedUrls) = await _uploadFileService.StartMultipartUploadAsync(newFileName, request.ContentType, request.PartsCount);

        if (string.IsNullOrEmpty(uploadId) || presignedUrls == null || presignedUrls.Count == 0)
        {
            result.Message = "Failed to initiate multipart upload.";
            result.Result = null!;
        }
        else
        {
            var dbValues = await _mediator.Send(new GetSystemSettingValuesQuery
            {
                Keys = new() { SettingKey.DigitalOcean_CDNEndpoint, SettingKey.DigitalOcean_SpaceName }
            });

            var cdnEndpoint = dbValues.GetValueOrDefault(SettingKey.DigitalOcean_CDNEndpoint, string.Empty);
            var spaceName = dbValues.GetValueOrDefault(SettingKey.DigitalOcean_SpaceName, string.Empty);
            if (string.IsNullOrEmpty(cdnEndpoint)) cdnEndpoint = _fallbackDO.CDNEndpoint;
            if (string.IsNullOrEmpty(spaceName)) spaceName = _fallbackDO.SpaceName;

            var folder = $"courses/{userId}";
            var fileUrl = $"{cdnEndpoint}/{spaceName}/{folder}/{newFileName}";

            result.Result = new StartMultipartUploadDto
            {
                UploadId = uploadId,
                FileName = newFileName,
                FileUrl = fileUrl,
                PresignedUrls = presignedUrls
            };
            result.Message = "Multipart session started successfully.";
        }
        return result;
    }
}
