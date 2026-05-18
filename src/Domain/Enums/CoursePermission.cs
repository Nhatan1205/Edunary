namespace Edunary.Domain.Enums;

[Flags]
public enum CoursePermission
{
    None = 0,
    View = 1 << 0,
    Manage = 1 << 1,
    Performance = 1 << 2,
    QA = 1 << 3,
    Assignments = 1 << 4,
    Reviews = 1 << 5,
    RevenueReport = 1 << 6,
}
