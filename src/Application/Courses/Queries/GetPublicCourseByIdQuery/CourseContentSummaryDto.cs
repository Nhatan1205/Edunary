namespace Edunary.Application.Courses.Queries.GetPublicCourseByIdQuery;
public class CourseContentSummaryDto
{
    public string TotalVideoDuration { get; set; }
    public List<SectionSummaryDto> Sections { get; set; }
}

public class SectionSummaryDto
{
    public string Title { get; set; }
    public List<ItemSummaryDto> Items { get; set; }
}

public class ItemSummaryDto
{
    public string Title { get; set; }
    public string ContentType { get; set; }
    public string VideoDuration { get; set; }
}
