using Edunary.Domain.Common;
using Edunary.Domain.Enums;

namespace Edunary.Domain.Entities;

public class RevenueSharePlan : BaseAuditableEntity
{
    public SalesChannel Channel { get; set; }
    public decimal InstructorPercentage { get; set; }
    public DateTimeOffset EffectiveFrom { get; set; }
    public DateTimeOffset? EffectiveTo { get; set; }
    public bool IsActive { get; set; } = true;
}
