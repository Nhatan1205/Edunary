namespace Edunary.Application.Common.Interfaces;

public interface IResponseCacheService
{
    Task<string> GetAsync(string key);
    Task SetAsync(string key, object value, TimeSpan duration);
    Task RemoveAsync(string key);
}
