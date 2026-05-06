namespace Edunary.Application.Common.Interfaces;

public interface IRedisService
{
    Task UpdateRedisConfig(string host, int port, string password);
}
