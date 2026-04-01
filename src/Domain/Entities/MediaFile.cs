using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Edunary.Domain.Entities;
public class MediaFile : BaseAuditableEntity
{
    public string UserId { get; set; }
    public string FileName { get; set; }
    public string FileUrl { get; set; }
    public string ContentType { get; set; }
    public int? CourseId { get; set; }
    public long FileSize { get; set; }

    // field from UploadSession
    public int ChunkSize { get; set; }
    public int TotalChunks { get; set; }
    public int UploadedChunks { get; set; }
    public string FileHash { get; set; }
    public UploadStatus Status { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string ThumbnailUrl { get; set;}
    public string HlsPath { get; set;}
    public VideoStatus HlsStatus { get; set;}
    public string Duration { get; set;}

    public bool IsDeleted { get; set; }
    // Navigation properties
#nullable enable
    public Course? Course { get; set; }
}
