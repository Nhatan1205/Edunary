using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Edunary.Application.Common.Models;

public class ChunkUploadRequest
{
    public string SessionId { get; set; }
    public int ChunkNumber { get; set; }
    public string ChunkHash { get; set; } // Optional: for chunk integrity verification
}
