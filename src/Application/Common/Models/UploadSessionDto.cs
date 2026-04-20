using System;
using Edunary.Domain.Enums;

namespace Edunary.Application.Common.Models;

public class UploadSessionDto
{
    public int SessionId { get; set; }
    public string FileName { get; set; }
    public long FileSize { get; set; }
    public int ChunkSize { get; set; }
    public int TotalChunks { get; set; }
    public int UploadedChunks { get; set; }
    public UploadStatus Status { get; set; }
    public DateTime ExpiresAt { get; set; }
    public double ProgressPercentage { get; set; }
    public int? CourseId { get; set; }
    public string FileUrl { get; set; }
    public string ContentType { get; set; }
    public string Duration { get; set; }
}
