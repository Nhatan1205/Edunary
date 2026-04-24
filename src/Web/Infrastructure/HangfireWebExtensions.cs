using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Common;
using Hangfire;
using HangfireBasicAuthenticationFilter;
using Microsoft.Extensions.Options;

namespace Edunary.Web.Infrastructure;

public static class HangfireWebExtensions
{
    public static IApplicationBuilder UseHangfireCustomDashboard(this IApplicationBuilder app, IWebHostEnvironment env)
    {
        var options = new DashboardOptions();

        var settings = app.ApplicationServices.GetRequiredService<IOptions<AccountToAccessHangfireDashboard>>().Value;

        options.Authorization = new[]
        {
            new HangfireCustomBasicAuthenticationFilter
            {
                User = settings.User,
                Pass = settings.Password
            }
        };

        app.UseHangfireDashboard("/HangfireDashboard", options);

        return app;
    }

    // Registers all Hangfire recurring jobs
    public static IApplicationBuilder UseHangfireRecurringJobs(this IApplicationBuilder app)
    {
        // Mark users Inactive if no activity for 30+ days
        RecurringJob.AddOrUpdate<IUserStatusJobService>(
            "mark-inactive-users",
            job => job.MarkInactiveUsersAsync(),
            Cron.Daily(2, 0),           // 2:00 AM UTC every day
            new RecurringJobOptions { TimeZone = TimeZoneInfo.Utc });

        return app;
    }
}
