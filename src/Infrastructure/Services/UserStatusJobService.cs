using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;
using Edunary.Infrastructure.Data;
using Edunary.Infrastructure.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Edunary.Infrastructure.Services;

public class UserStatusJobService : IUserStatusJobService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UserStatusJobService> _logger;
    private readonly JobSettings _jobSettings;

    public UserStatusJobService(
        ApplicationDbContext context,
        ILogger<UserStatusJobService> logger,
        IOptions<JobSettings> jobSettings)
    {
        _context = context;
        _logger = logger;
        _jobSettings = jobSettings.Value;
    }

    public async Task MarkInactiveUsersAsync()
    {
        _logger.LogInformation(
            "Starting MarkInactiveUsersAsync job at {Time} (threshold: {Days} days)",
            DateTime.UtcNow, _jobSettings.InactiveDaysThreshold);

        try
        {
            // ActivityLog.Created is DateTimeOffset
            var activityCutoff = DateTimeOffset.UtcNow.AddDays(-_jobSettings.InactiveDaysThreshold);

            // ApplicationUser.CreatedAt is DateTime
            var createdAtCutoff = DateTime.UtcNow.AddDays(-_jobSettings.InactiveDaysThreshold);

            var affectedRows = await _context.Users
                .Where(u => u.Status == UserStatus.Active)
                .Where(u =>
                    // No recent activity in the past N days
                    !_context.ActivityLogs.Any(a => a.UserId == u.Id && a.Created >= activityCutoff))
                .Where(u =>
                    // has old logs or no logs at all but account is old enough
                    _context.ActivityLogs.Any(a => a.UserId == u.Id)
                    || u.CreatedAt < createdAtCutoff)
                .ExecuteUpdateAsync(setters =>
                    setters.SetProperty(u => u.Status, UserStatus.Inactive));

            _logger.LogInformation(
                "MarkInactiveUsersAsync completed. {Count} user(s) marked as Inactive.",
                affectedRows);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while running MarkInactiveUsersAsync job.");
            throw; 
        }
    }
}
