using Edunary.Application.Common.Models;

namespace Edunary.Application.Common.Interfaces;
public interface INotifyService
{
    Task NotifyCourseUpdated(NotificationRequest request, CancellationToken cancellationToken);
    Task NotifyUserAsync(string userId, string title, string message, string type, object payload, CancellationToken cancellationToken = default);

}
