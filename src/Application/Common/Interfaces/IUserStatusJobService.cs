namespace Edunary.Application.Common.Interfaces;

public interface IUserStatusJobService
{
    /// <summary>
    /// Scans all Active users and marks them as Inactive
    /// if their latest ActivityLog is older than 30 days (or no activity exists and account is older than 30 days).
    /// Called by Hangfire RecurringJob daily at 2:00 AM UTC.
    /// </summary>
    Task MarkInactiveUsersAsync();
}
