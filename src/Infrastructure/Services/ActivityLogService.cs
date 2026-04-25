using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Edunary.Infrastructure.Data;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Edunary.Infrastructure.Services;

public class ActivityLogService : IActivityLogService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ActivityLogService> _logger;

    public ActivityLogService(IServiceProvider serviceProvider, ILogger<ActivityLogService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public void EnqueueLog(ActivityLogEntry entry)
    {
        BackgroundJob.Enqueue<ActivityLogService>(s => s.SaveLogAsync(entry));
    }

    public async Task SaveLogAsync(ActivityLogEntry entry)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            context.ActivityLogs.Add(new ActivityLog
            {
                UserId = entry.UserId,
                ActivityType = entry.ActivityType,
                Description = entry.Description,
            });

            // Update user status to Active if Inactive
            await context.Users
                .Where(u => u.Id == entry.UserId && u.Status == UserStatus.Inactive)
                .ExecuteUpdateAsync(setters => setters.SetProperty(u => u.Status, UserStatus.Active), CancellationToken.None);

            await context.SaveChangesAsync(CancellationToken.None);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ActivityLogService: Failed to save activity log. UserId={UserId} Action={Action}",
                entry.UserId, entry.ActivityType);
            throw;
        }
    }
}
