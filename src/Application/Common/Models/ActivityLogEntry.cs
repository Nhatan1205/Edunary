using Edunary.Domain.Enums;

namespace Edunary.Application.Common.Models;

public class ActivityLogEntry
{
    public string UserId { get; set; }
    public ActivityType ActivityType { get; set; }
    public string Description { get; set; }
}
