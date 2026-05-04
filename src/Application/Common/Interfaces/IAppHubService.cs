namespace Edunary.Application.Common.Interfaces;

/// <summary>
/// Base real-time service. Always broadcasts to all connected clients.
/// Clients filter by event name on their side.
/// </summary>
public interface IAppHubService
{
    /// <summary>
    /// Broadcast message to all connected clients.
    /// </summary>
    /// <param name="eventName">
    /// Format: {Feature}.{Action}:{TargetId}
    /// Example: "Notification.New:user123"
    /// </param>
    /// <param name="data">Payload object</param>
    Task SendAsync<T>(string eventName, T data);
}
