namespace Edunary.Domain.Entities;

public class CourseNote : BaseAuditableEntity
{
    public int CourseId { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public int VideoId { get; set; }
    #nullable enable
    public string? ItemId { get; set; }
    public double TimestampSeconds { get; set; }
    public string Content { get; set; } = string.Empty;

    public Course Course { get; set; } = null!;
    public MediaFile MediaFile { get; set; } = null!;
}
