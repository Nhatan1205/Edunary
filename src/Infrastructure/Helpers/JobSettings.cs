namespace Edunary.Infrastructure.Helpers;

public class JobSettings
{
    // Number of days of inactivity before a user is marked as Inactive.
    public int InactiveDaysThreshold { get; set; } = 30;
}
