using Edunary.Application.Common.Interfaces;
using Edunary.Infrastructure.Helpers;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using StackExchange.Redis;

namespace Edunary.Infrastructure.Services;

public interface IRedisConnectionProvider : IRedisService
{
    Task InitializeAsync();
    IDatabase GetDatabase();
}

public class RedisService : IRedisConnectionProvider, IDisposable
{
    private readonly RedisSetting _appSettings;
    private readonly ILogger<RedisService> _logger;
#nullable enable
    private IConnectionMultiplexer? _connection;

    public RedisService(IOptionsMonitor<RedisSetting> redisSettingMonitor, ILogger<RedisService> logger)
    {
        _appSettings = redisSettingMonitor.CurrentValue;
        _logger = logger;
    }

    public async Task InitializeAsync()
    {
        await ConnectAsync(_appSettings.RedisHost, _appSettings.RedisPort, _appSettings.RedisPassword);
    }

    public async Task UpdateRedisConfig(string host, int port, string password)
    {
        _logger.LogInformation("Updating Redis configuration to Host={Host}, Port={Port}", host, port);

        // Close existing connection
        if (_connection != null)
        {
            await _connection.CloseAsync();
            _connection.Dispose();
            _connection = null;
        }

        // Connect with new config
        await ConnectAsync(host, port, password);
    }

    private async Task ConnectAsync(string host, int port, string password)
    {
        try
        {
            string configString = $"{host}:{port},abortConnect=false";
            if (!string.IsNullOrWhiteSpace(password))
            {
                configString += $",password={password}";
            }

            _connection = await ConnectionMultiplexer.ConnectAsync(configString);
            _logger.LogInformation("Successfully connected to Redis at {Host}:{Port}", host, port);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to connect to Redis at {Host}:{Port}", host, port);
        }
    }

    public IDatabase GetDatabase()
    {
        if (_connection == null || !_connection.IsConnected)
        {
            _logger.LogWarning("Redis connection is not active. Attempting to retrieve database may fail.");
            // We can return _connection?.GetDatabase() which might throw if null, 
            // but it's standard StackExchange.Redis behavior.
        }

        return _connection!.GetDatabase();
    }

    public void Dispose()
    {
        if (_connection != null)
        {
            _connection.Close();
            _connection.Dispose();
        }
    }
}
