namespace Edunary.Application.Common.Interfaces;
public interface INotificationCourseService
{
    Task NotifyCourseUpdatedAsync(int courseId, string title, string message, CancellationToken cancellationToken);
}

