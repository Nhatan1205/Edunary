namespace Edunary.Domain.Entities;

public class Enrollment : BaseAuditableEntity
{
    public int CourseId { get; set; }
    public string StudentId { get; set; } = string.Empty;

    public Course Course { get; set; } = null!;
}
