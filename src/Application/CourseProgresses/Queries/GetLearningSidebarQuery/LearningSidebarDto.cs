namespace Edunary.Application.CourseProgresses.Queries.GetLearningSidebarQuery;

public class LearningSidebarDto
{
    public string Id { get; set; }
    public string Title { get; set; }
    public List<SectionDto> Sections { get; set; }
}
public class SectionDto
{
    public string SectionId { get; set; }
    public string Title { get; set; }
    public List<ItemDto> Items { get; set; }
}
public class ItemDto
{
    public string ItemId { get; set; }
    public string Title { get; set; }
    public string Type { get; set; }
    public string ContentType { get; set; }
    public bool IsCompleted { get; set; }
    public string VideoDuration { get; set; }
    public List<ResourceDto> Resources { get; set; }
}
public class ResourceDto
{
    public string ResourceId { get; set; }
    public string FileName { get; set; }
    public string FileUrl { get; set; }
}
