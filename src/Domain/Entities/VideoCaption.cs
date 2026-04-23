using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Edunary.Domain.Entities;

public class VideoCaption : BaseAuditableEntity
{
    public int MediaFileId { get; set; }
    public Languages Language { get; set; }
    public string FileName { get; set; }
    public string FileUrl { get; set; }
    public long FileSize { get; set; }
    public CaptionStatus Status { get; set; }

    public MediaFile MediaFile { get; set; } = null!;
}
