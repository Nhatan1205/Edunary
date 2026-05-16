using Edunary.Domain.Enums;

namespace Edunary.Application.Common.Interfaces;

public interface ICourseAuthorizationService
{
    Task<bool> HasCourseAccessAsync(
        int courseId,
        string userId,
        CoursePermission requiredPermission = CoursePermission.None,
        CancellationToken cancellationToken = default);

    Task<bool> IsOwnerAsync(
        int courseId,
        string userId,
        CancellationToken cancellationToken = default);

    Task EnsureCourseAccessAsync(
        int courseId,
        string userId,
        CoursePermission requiredPermission = CoursePermission.None,
        CancellationToken cancellationToken = default);

    Task EnsureOwnerAsync(
        int courseId,
        string userId,
        CancellationToken cancellationToken = default);
}
