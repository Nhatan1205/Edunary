using Edunary.Application.Common.Behaviours;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Constants;
using Edunary.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace Edunary.Application.SystemSettings.Commands.UpdateSystemSettingsCommand;


[ActivityLog(ActivityType.UpdateSystemSetting, "Update System settings")]
public class UpdateSystemSettingsCommand : IRequest<Result>
{
    public List<UpdateSettingItem> Settings { get; init; } = new();
}

public class UpdateSystemSettingsCommandHandler : IRequestHandler<UpdateSystemSettingsCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IRedisService _redisService;
    private readonly ILogger<UpdateSystemSettingsCommandHandler> _logger;

    public UpdateSystemSettingsCommandHandler(
        IApplicationDbContext context,
        IRedisService redisService,
        ILogger<UpdateSystemSettingsCommandHandler> logger)
    {
        _context = context;
        _redisService = redisService;
        _logger = logger;
    }

    public async Task<Result> Handle(UpdateSystemSettingsCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var requestedKeys = request.Settings.Select(s => s.Key).ToList();

            var existingSettings = await _context.SystemSettings
                .Where(s => requestedKeys.Contains(s.Key))
                .ToListAsync(cancellationToken);

            bool redisConfigChanged = false;
            string newRedisHost = null;
            string newRedisPortStr = null;
            string newRedisPassword = null;

            foreach (var item in request.Settings)
            {
                var setting = existingSettings.FirstOrDefault(s => s.Key == item.Key);
                Guard.Against.NotFound(item.Key, setting);

                if (setting.Value != item.Value)
                {
                    setting.Value = item.Value;

                    if (item.Key == SettingKey.Redis_Host)
                    {
                        redisConfigChanged = true;
                        newRedisHost = item.Value;
                    }
                    else if (item.Key == SettingKey.Redis_Port)
                    {
                        redisConfigChanged = true;
                        newRedisPortStr = item.Value;
                    }
                    else if (item.Key == SettingKey.Redis_Password)
                    {
                        redisConfigChanged = true;
                        newRedisPassword = item.Value;
                    }
                }
            }

            var result = await _context.SaveChangesAsync(cancellationToken);
            if (result > 0)
            {
                if (redisConfigChanged)
                {
                    await UpdateAppSettingsAndReloadRedis(newRedisHost, newRedisPortStr, newRedisPassword, cancellationToken);
                }

                return Result.Success(message: "Settings updated successfully.");
            }

            return Result.Failure("Settings update failed.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"An error occurred: {ex.Message}");
        }
    }

    private async Task UpdateAppSettingsAndReloadRedis(string newHost, string newPortStr, string newPassword, CancellationToken ct)
    {
        try
        {
            // We need to fetch the full current config in case only one field was updated
            var host = newHost ?? await GetSettingValueAsync(SettingKey.Redis_Host, ct) ?? "localhost";
            var portStr = newPortStr ?? await GetSettingValueAsync(SettingKey.Redis_Port, ct) ?? "6379";
            var password = newPassword ?? await GetSettingValueAsync(SettingKey.Redis_Password, ct) ?? string.Empty;

            int port = int.TryParse(portStr, out int p) ? p : 6379;

            // 1. Update appsettings.json
            var appSettingsPath = Path.Combine(Directory.GetCurrentDirectory(), "appsettings.json");
            if (File.Exists(appSettingsPath))
            {
                var json = await File.ReadAllTextAsync(appSettingsPath, ct);
                var jObject = System.Text.Json.Nodes.JsonNode.Parse(json) as System.Text.Json.Nodes.JsonObject;

                if (jObject != null)
                {
                    if (!jObject.ContainsKey("RedisSetting"))
                    {
                        jObject["RedisSetting"] = new System.Text.Json.Nodes.JsonObject();
                    }

                    jObject["RedisSetting"]!["RedisHost"] = host;
                    jObject["RedisSetting"]!["RedisPort"] = port;
                    jObject["RedisSetting"]!["RedisPassword"] = password;

                    var options = new System.Text.Json.JsonSerializerOptions { WriteIndented = true };
                    await File.WriteAllTextAsync(appSettingsPath, jObject.ToJsonString(options), ct);
                    _logger.LogInformation("Updated appsettings.json with new Redis configuration.");
                }
            }
            else
            {
                _logger.LogWarning("appsettings.json not found at {Path}. Cannot persist Redis settings.", appSettingsPath);
            }

            // 2. Hot-reload the singleton connection
            await _redisService.UpdateRedisConfig(host, port, password);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update appsettings.json or reload Redis configuration.");
        }
    }

    private async Task<string> GetSettingValueAsync(string key, CancellationToken ct)
    {
        return await _context.SystemSettings
            .Where(s => s.Key == key)
            .Select(s => s.Value)
            .FirstOrDefaultAsync(ct);
    }
}

