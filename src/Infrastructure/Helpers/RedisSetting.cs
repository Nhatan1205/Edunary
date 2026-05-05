namespace Edunary.Infrastructure.Helpers;

public class RedisSetting
{
    public string RedisHost { get; set; } = "localhost";
    public int RedisPort { get; set; } = 6379;
    public string RedisPassword { get; set; } = string.Empty;
}
