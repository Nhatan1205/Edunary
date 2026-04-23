using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edunary.Domain.Enums;

namespace Edunary.Application.MediaFiles.Queries.GetHlsVideoByCourseIdQuery;

public class HlsVideoCaptionDto
{
    public int VideoId { get; set; }
    public string VideoTitle { get; set; } = string.Empty;
    public bool isCaptioned => CaptionId.HasValue;
    public int? CaptionId { get; set; }
    #nullable enable
    public string? CaptionFileName { get; set; }
    public CaptionStatus? UploadStatus {get; set;}
}
