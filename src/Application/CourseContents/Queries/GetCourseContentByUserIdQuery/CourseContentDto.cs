using Edunary.Domain.Entities;

namespace Edunary.Application.CourseContents.Queries.GetCourseContentByUserIdQuery;

public class CourseContentDto
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
            CreateMap<CourseContent, CourseContentDto>();
        }
    }
}
