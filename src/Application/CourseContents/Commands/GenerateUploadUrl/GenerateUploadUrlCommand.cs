using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Common;
using Microsoft.Extensions.Options;

namespace Edunary.Application.CourseContents.Commands.GenerateUploadUrl;

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
    private readonly DigitalOceanSettings _spacesSettings;

    public GenerateUploadUrlCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IUploadFileService uploadFileService,
        IOptions<DigitalOceanSettings> spacesOptions)
    {
        _context = context;
        _currentUserService = currentUserService;
        _uploadFileService = uploadFileService;
        _spacesSettings = spacesOptions.Value;
    }

    public async Task<ReturnResult<GenerateUploadUrlDto>> Handle(GenerateUploadUrlCommand request, CancellationToken cancellationToken)
    {
        var result = new ReturnResult<GenerateUploadUrlDto>();
        var userId = _currentUserService?.UserId;
        var baseFileName = Path.GetFileNameWithoutExtension(request.FileName).Trim();
        var extension = Path.GetExtension(request.FileName);
        var newFileName = request.FileName.Trim();
        var count = 1;
        var existingFileNames = await _context.CourseContents
        .Where(cc => cc.FileName.StartsWith(baseFileName) && cc.UserId == userId && cc.ContentType == request.ContentType)
        .Select(cc => cc.FileName)
        .ToHashSetAsync(cancellationToken);

        while (existingFileNames.Contains(newFileName))
        {
            newFileName = $"{baseFileName}({count}){extension}";
            count++;
        }
        var presignedUrl = _uploadFileService.GeneratePresignedUrl(newFileName, request.ContentType);
        if (string.IsNullOrEmpty(presignedUrl))
        {
            result.Message = "Failed to generate presigned URL.";
            result.Result = null;
        }
        else
        {
            var folder = $"courses/{userId}";
            var fileUrl = $"{_spacesSettings.CDNEndpoint}/{folder}/{newFileName}";
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