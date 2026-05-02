using Edunary.Application.Common.Models;

namespace Edunary.Application.CourseEmbeddings.Queries.GetCourseEmbeddingSyncStatus;

public class CourseEmbeddingSyncStatusDto
{
    public int TotalPublicCourses { get; init; }
    public int TotalEmbedded { get; init; }
    public int TotalMissing { get; init; }
    public PaginatedList<CourseEmbeddingItemDto> Data { get; init; }
}

public class CourseEmbeddingItemDto
{
    public int CourseId { get; init; }
    public string Title { get; init; }
    public string InstructorName { get; init; }
    public bool IsEmbedded { get; init; }
}
