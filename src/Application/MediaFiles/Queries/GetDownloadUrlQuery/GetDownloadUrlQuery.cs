using System;
using System.Threading;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.MediaFiles.Queries.GetDownloadUrlQuery;

public class GetDownloadUrlQuery : IRequest<DownloadUrlDto>
{
    public int MediaFileId { get; set; }
}

public class GetDownloadUrlQueryHandler : IRequestHandler<GetDownloadUrlQuery, DownloadUrlDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IUploadFileService _uploadFileService;

    public GetDownloadUrlQueryHandler(IApplicationDbContext context, IUploadFileService uploadFileService)
    {
        _context = context;
        _uploadFileService = uploadFileService;
    }

    public async Task<DownloadUrlDto> Handle(GetDownloadUrlQuery request, CancellationToken cancellationToken)
    {
        var mediaFile = await _context.MediaFiles.FirstOrDefaultAsync(m => m.Id == request.MediaFileId, cancellationToken);
        if (mediaFile == null || string.IsNullOrEmpty(mediaFile.FileUrl))
        {
            throw new Exception($"Media file with ID {request.MediaFileId} not found or has no valid URL.");
        }

        // Form the S3 key from the known pattern: courses/{userId}/{fileName}
        string key = $"courses/{mediaFile.UserId}/{mediaFile.FileName}";

        string presignedUrl = await _uploadFileService.GeneratePresignedDownloadUrlAsync(key, mediaFile.FileName);
        var rs = new DownloadUrlDto()
        {
          Url = presignedUrl  
        };
        return rs;
    }
}
