namespace Edunary.Application.Common.Interfaces;
public interface IConnectionManagerService
{
    void AddConnection(string userId, string connectionId);
    void RemoveConnection(string connectionId);
    IReadOnlyList<string> GetConnections(string userId);
    IReadOnlyList<string> GetAllOnlineUserIds();
    int GetOnlineCount();
}
