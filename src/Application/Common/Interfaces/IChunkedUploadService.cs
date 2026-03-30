using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Common.Interfaces;

public interface IChunkedUploadService
{
    Task<UploadSessionDto> InitiateUpload(InitiateUploadRequest request);
    Task<UploadSessionDto> UploadChunk(Stream chunkStream, ChunkUploadRequest request);
    Task<UploadSessionDto> GetUploadStatus(string sessionId);
}
