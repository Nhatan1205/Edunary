namespace Edunary.Application.Common.Interfaces;

public interface IConnectionManagerService
{
    Task AddConnectionAsync(string userId, string connectionId);
    Task RemoveConnectionAsync(string connectionId);
    Task<bool> IsConnectedAsync(string userId);
    Task<long> GetOnlineCountAsync();
}
