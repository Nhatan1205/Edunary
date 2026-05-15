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

    public static IApplicationBuilder UseHangfireRecurringJobs(this IApplicationBuilder app)
    {
        RecurringJob.AddOrUpdate<IUserStatusJobService>(
            "mark-inactive-users",
            job => job.MarkInactiveUsersAsync(),
            Cron.Daily(2, 0),
            new RecurringJobOptions { TimeZone = TimeZoneInfo.Utc });

        RecurringJob.AddOrUpdate<ICourseProgressFlushService>(
            "flush-video-progress",
            job => job.FlushCachedProgressAsync(CancellationToken.None),
            Cron.Minutely(),
            new RecurringJobOptions { TimeZone = TimeZoneInfo.Utc });

        return app;
    }
}
