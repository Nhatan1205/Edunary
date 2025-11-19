namespace Edunary.Domain.Entities;

public class Cart : BaseAuditableEntity
{
    public string CourseId { get; set; }
    public string CustomerId { get; set; }
}