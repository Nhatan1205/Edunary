using Edunary.Domain.Enums;

namespace Edunary.Application.ActivityLogs.Queries.GetActivityLogsQuery;

public class ActivityLogDto
{
    public int Id { get; set; }
    public string UserId { get; set; }

    public string FullName { get; set; }
    public string Email { get; set; }
    public string Avatar { get; set; }

    public ActivityType ActivityType { get; set; }
    public string Description { get; set; }
    public DateTimeOffset Created { get; set; }
}
