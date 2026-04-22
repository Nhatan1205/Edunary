namespace Edunary.Domain.Entities;

public class OrderItem : BaseEntity
{
    public int OrderId { get; set; }
    public int CourseId { get; set; }
    public string CourseName { get; set; } = string.Empty;
    public float Price { get; set; }

    // Navigation property
    public Order Order { get; set; } = null!;
}