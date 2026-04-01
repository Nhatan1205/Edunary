using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Edunary.Application.Common.Models;

public class InitiateUploadRequest
{
    public string FileName { get; set; }
    public long FileSize { get; set; }
    public int ChunkSize { get; set; }
    public int TotalChunks { get; set; }
    public string FileHash { get; set; }
    public string ContentType { get; set; }
    public int CourseId { get; set; }
}
