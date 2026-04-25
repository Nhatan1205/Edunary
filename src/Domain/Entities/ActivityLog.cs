using Edunary.Domain.Common;
using Edunary.Domain.Enums;

namespace Edunary.Domain.Entities;

public class ActivityLog : BaseAuditableEntity
{
    public string UserId { get; set; }
    public ActivityType ActivityType { get; set; }
    public string Description { get; set; }
}
