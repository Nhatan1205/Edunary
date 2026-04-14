using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.SystemSettings.Queries.GetSystemSettingValuesQuery;
using Edunary.Domain.Common;
using Edunary.Domain.Constants;
using Microsoft.Extensions.Options;

namespace Edunary.Application.MediaFiles.Commands.GenerateUploadUrl;

public class GenerateUploadUrlCommand : IRequest<ReturnResult<GenerateUploadUrlDto>>
{
    public string FileName { get; set; }
    public string ContentType { get; set; }
}
public class GenerateUploadUrlCommandHandler : IRequestHandler<GenerateUploadUrlCommand, ReturnResult<GenerateUploadUrlDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUploadFileService _uploadFileService;
    private readonly IMediator _mediator;
    private readonly DigitalOceanSettings _fallbackDO;

    public GenerateUploadUrlCommandHandler(
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

    public async Task<ReturnResult<GenerateUploadUrlDto>> Handle(GenerateUploadUrlCommand request, CancellationToken cancellationToken)
    {
        var result = new ReturnResult<GenerateUploadUrlDto>();
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

        var presignedUrl = await _uploadFileService.GeneratePresignedUrl(newFileName, request.ContentType);
        if (string.IsNullOrEmpty(presignedUrl))
        {
            result.Message = "Failed to generate presigned URL.";
            result.Result = null;
        }
        else
        {
            var dbValues = await _mediator.Send(new GetSystemSettingValuesQuery
            {
                Keys = new() { SettingKey.DigitalOcean_CDNEndpoint }
            });

            var cdnEndpoint = dbValues.GetValueOrDefault(SettingKey.DigitalOcean_CDNEndpoint, string.Empty);
            if (string.IsNullOrEmpty(cdnEndpoint)) cdnEndpoint = _fallbackDO.CDNEndpoint;

            var folder = $"courses/{userId}";
            var fileUrl = $"{cdnEndpoint}/{folder}/{newFileName}";
            result.Result = new GenerateUploadUrlDto
            {
                UploadUrl = presignedUrl,
                FileName = newFileName,
                FileUrl = fileUrl
            };
            result.Message = "Presigned URL generated successfully.";
        }
        return result;
    }
}
