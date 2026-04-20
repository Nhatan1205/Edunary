using System.Collections.Concurrent;
using Edunary.Application.Common.Interfaces;

namespace Edunary.Infrastructure.Services;
public class ConnectionManagerService : IConnectionManagerService
{
    private readonly ConcurrentDictionary<string, HashSet<string>> _userConnections = new();
    public void AddConnection(string userId, string connectionId)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(connectionId))
            return;

        var connections = _userConnections.GetOrAdd(userId, _ => new HashSet<string>());

        lock (connections)
        {
            connections.Add(connectionId);
        }
    }

    public void RemoveConnection(string connectionId)
    {
        if (string.IsNullOrWhiteSpace(connectionId))
            return;

        foreach (var (userId, connections) in _userConnections)
        {
            lock (connections)
            {
                if (connections.Remove(connectionId) && connections.Count == 0)
                {
                    _userConnections.TryRemove(userId, out _);
                }
            }
        }
    }

    public IReadOnlyList<string> GetConnections(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return Array.Empty<string>();

        if (_userConnections.TryGetValue(userId, out var connections))
        {
            lock (connections)
            {
                return connections.ToList().AsReadOnly();
            }
        }

        return Array.Empty<string>();
    }

    public IReadOnlyList<string> GetAllOnlineUserIds()
    {
        return _userConnections.Keys.ToList().AsReadOnly();
    }

    public int GetOnlineCount()
    {
        return _userConnections.Count;
    }
    
}
