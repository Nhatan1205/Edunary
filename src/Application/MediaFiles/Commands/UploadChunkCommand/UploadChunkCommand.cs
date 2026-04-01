using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

namespace Edunary.Application.MediaFiles.Commands.UploadChunkCommand;

public class UploadChunkCommand : IRequest<UploadSessionDto>
{
    public string SessionId { get; set; }
    public int ChunkNumber { get; set; }
    public Stream ChunkStream { get; set; }
    public string ChunkHash { get; set; }
}

public class UploadChunkCommandHandler : IRequestHandler<UploadChunkCommand, UploadSessionDto>
{
    private readonly IChunkedUploadService _chunkedUploadService;

    public UploadChunkCommandHandler(IChunkedUploadService chunkedUploadService)
    {
        _chunkedUploadService = chunkedUploadService;
    }

    public async Task<UploadSessionDto> Handle(UploadChunkCommand request, CancellationToken cancellationToken)
    {
        var chunkUploadRequest = new ChunkUploadRequest
        {
            SessionId = request.SessionId,
            ChunkNumber = request.ChunkNumber,
            ChunkHash = request.ChunkHash
        };

        var result = await _chunkedUploadService.UploadChunk(request.ChunkStream, chunkUploadRequest);
        return result;
    }
}
