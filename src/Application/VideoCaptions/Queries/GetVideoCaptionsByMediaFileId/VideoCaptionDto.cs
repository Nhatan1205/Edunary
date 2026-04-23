using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;

namespace Edunary.Application.VideoCaptions.Queries.GetVideoCaptionsByMediaFileId;
public class VideoCaptionDto
{
    public int Id { get; set; }
    public int Language { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
}