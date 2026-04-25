namespace Edunary.Domain.Entities;

public class Cart : BaseAuditableEntity
{
    public int CourseId { get; set; }
    public string CustomerId { get; set; }
}