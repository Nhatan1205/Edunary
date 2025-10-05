namespace Edunary.Domain.Entities;
public class Course : BaseAuditableEntity
{
    public string Title { get; set; }
    public string Description { get; set; }
    public float Price { get; set; }

    public int CategoryId { get; set; }

    public Category Category { get; set; } = null!;
}
