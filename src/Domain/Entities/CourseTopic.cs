namespace Edunary.Domain.Entities;

public class CourseTopic : BaseAuditableEntity
{
    public string Name { get; set; } = null!;

    // Navigation
    public ICollection<Course> Courses { get; set; } = new List<Course>();
}
