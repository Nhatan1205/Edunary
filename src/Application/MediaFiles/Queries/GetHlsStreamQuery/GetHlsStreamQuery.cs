using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;

namespace Edunary.Application.MediaFiles.Queries.GetHlsStreamQuery;

public class GetHlsStreamQuery : IRequest<GetHlsStreamResult>
{
    public string VideoId { get; set; } = null!;
    public string FileName { get; set; } = null!;
    public string RootPath { get; set; }
}

public class GetHlsStreamQueryHandler : IRequestHandler<GetHlsStreamQuery, GetHlsStreamResult>
{
    private readonly ISender _sender;

    public GetHlsStreamQueryHandler(ISender sender)
    {
        _sender = sender;
    }

    public async Task<GetHlsStreamResult> Handle(GetHlsStreamQuery request, CancellationToken cancellationToken)
    {
        if (!int.TryParse(request.VideoId, out int parsedVideoId))
        {
            return new GetHlsStreamResult { ErrorType = "BadRequest", ErrorMessage = "Invalid video request." };
        }

        var hasAccess = await _sender.Send(new Edunary.Application.MediaFiles.Queries.CheckMediaFileAccessQuery.CheckMediaFileAccessQuery
        { 
            VideoId = parsedVideoId 
        }, cancellationToken);

        if (!hasAccess) 
        {
            return new GetHlsStreamResult { ErrorType = "Forbid" };
        }

        var rootPath = request.RootPath;
        if (string.IsNullOrEmpty(rootPath)) 
        {
            return new GetHlsStreamResult { ErrorType = "NotFound" };
        }

        var physicalPath = Path.Combine(rootPath, "hls", request.VideoId, request.FileName);
        
        var fullPath = Path.GetFullPath(physicalPath);
        if (!fullPath.StartsWith(Path.Combine(rootPath, "hls"), StringComparison.OrdinalIgnoreCase))
        {
            return new GetHlsStreamResult { ErrorType = "Forbid" };
        }

        if (!File.Exists(fullPath))
        {
            return new GetHlsStreamResult { ErrorType = "NotFound" };
        }

        string contentType = request.FileName.EndsWith(".m3u8", StringComparison.OrdinalIgnoreCase) 
            ? "application/vnd.apple.mpegurl" 
            : (request.FileName.EndsWith(".ts", StringComparison.OrdinalIgnoreCase) ? "video/MP2T" : "application/octet-stream");

        return new GetHlsStreamResult 
        { 
            FilePath = fullPath, 
            ContentType = contentType 
        };
    }
}
