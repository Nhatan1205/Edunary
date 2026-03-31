using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

namespace Edunary.Application.MediaFiles.Queries.GetUploadStatusQuery;

public class GetUploadStatusQuery : IRequest<UploadSessionDto>
{
    public string SessionId { get; set; }
}

public class GetUploadStatusQueryHandler : IRequestHandler<GetUploadStatusQuery, UploadSessionDto>
{
    private readonly IChunkedUploadService _chunkedUploadService;

    public GetUploadStatusQueryHandler(IChunkedUploadService chunkedUploadService)
    {
        _chunkedUploadService = chunkedUploadService;
    }

    public async Task<UploadSessionDto> Handle(GetUploadStatusQuery request, CancellationToken cancellationToken)
    {
        var result = await _chunkedUploadService.GetUploadStatus(request.SessionId);
        return result;
    }
}
