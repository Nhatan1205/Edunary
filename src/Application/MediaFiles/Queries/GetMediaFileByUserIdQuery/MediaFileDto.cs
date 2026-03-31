using Edunary.Domain.Entities;

namespace Edunary.Application.MediaFiles.Queries.GetMediaFileByUserIdQuery;

public class MediaFileDto
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public string FileName { get; set; }
    public string FileUrl { get; set; }
    public string ContentType { get; set; }
    public int? CourseId { get; set; }
    public DateTimeOffset LastModified { get; set; }
    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<MediaFile, MediaFileDto>();
        }
    }
}
