using System.Text;
using Amazon;
using Amazon.S3;
using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Common;
using Edunary.Domain.Constants;
using Edunary.Infrastructure.Data;
using Edunary.Infrastructure.Data.Interceptors;
using Edunary.Infrastructure.Helpers;
using Edunary.Infrastructure.Identity;
using Edunary.Infrastructure.Services;
using Hangfire;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Microsoft.Extensions.DependencyInjection;
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        Guard.Against.Null(connectionString, message: "Connection string 'DefaultConnection' not found.");

        services.AddScoped<ISaveChangesInterceptor, AuditableEntityInterceptor>();
        services.AddScoped<ISaveChangesInterceptor, DispatchDomainEventsInterceptor>();

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.AddInterceptors(sp.GetServices<ISaveChangesInterceptor>());

            options.UseSqlServer(connectionString);
        });

        services.Configure<CloudinarySettings>(configuration.GetSection("CloudinarySettings"));
        services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));

        services.Configure<DigitalOceanSettings>(configuration.GetSection("DigitalOceanSettings"));
        services.AddSingleton<IAmazonS3>(sp =>
        {
            var settings = sp.GetRequiredService<IOptions<DigitalOceanSettings>>().Value;

            return new AmazonS3Client(
                settings.AccessKey,
                settings.SecretKey,
                new AmazonS3Config
                {
                    ServiceURL = settings.Endpoint,
                    ForcePathStyle = true
                });
        });


        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

        services.AddScoped<ApplicationDbContextInitialiser>();

        services
            .AddIdentity<ApplicationUser, ApplicationRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>().AddDefaultTokenProviders();

        services.AddSingleton(TimeProvider.System);
        services.AddTransient<IIdentityService, IdentityService>();
        services.AddTransient<IEmailService, EmailService>();
        services.AddScoped<IPaymentService, StripePaymentService>();
        services.AddScoped<IUploadFileService, UploadFileService>();
        services.AddScoped<INotifyService, NotifyService>();
        services.AddScoped<IFilterService, FilterService>();
        services.AddSingleton<IConnectionManagerService, ConnectionManagerService>();
        services.AddScoped<IChunkedUploadService, ChunkedUploadService>();

        services.AddAuthorization(options =>
            options.AddPolicy(Policies.CanPurge, policy => policy.RequireRole(Roles.Administrator)));

        var appSettingsSection = configuration.GetSection("AppSettings");
        services.Configure<AppSettings>(appSettingsSection);

        services.AddAuthentication(x =>
        {
            x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;

        })
        .AddJwtBearer(x =>
        {
            x.RequireHttpsMetadata = false;
            x.SaveToken = true;
            x.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(appSettingsSection.Get<AppSettings>().AccessTokenKey)),
                ValidateIssuer = false,
                ValidateAudience = false
            };
            x.Events = new JwtBearerEvents
            {
                //for SignalR
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;

                    if (!string.IsNullOrEmpty(accessToken) &&
                        path.StartsWithSegments("/NotificationHub"))
                    {
                        context.Token = accessToken;
                    }
                    return Task.CompletedTask;
                }
            };
        });

        //Hangfire configuration
        services.AddHangfire(configuration => configuration
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UseSqlServerStorage(connectionString));
        services.AddHangfireServer();
        return services;
    }
}
