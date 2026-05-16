using Edunary.Application.Common.Exceptions;
using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Infrastructure.Services;

public class CourseAuthorizationService : ICourseAuthorizationService
{
    private readonly IApplicationDbContext _context;

    // Request-scoped cache to avoid repeated DB hits within the same request
    private readonly Dictionary<(int courseId, string userId), (bool isOwner, CoursePermission perms)> _cache = new();

    public CourseAuthorizationService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> HasCourseAccessAsync(
        int courseId, string userId,
        CoursePermission requiredPermission = CoursePermission.None,
        CancellationToken cancellationToken = default)
    {
        var (isOwner, perms) = await LoadAsync(courseId, userId, cancellationToken);

        if (isOwner) return true;

        if (requiredPermission == CoursePermission.None)
            return perms != CoursePermission.None;

        return perms.HasFlag(requiredPermission);
    }

    public async Task<bool> IsOwnerAsync(
        int courseId, string userId,
        CancellationToken cancellationToken = default)
    {
        var (isOwner, _) = await LoadAsync(courseId, userId, cancellationToken);
        return isOwner;
    }

    public async Task EnsureCourseAccessAsync(
        int courseId, string userId,
        CoursePermission requiredPermission = CoursePermission.None,
        CancellationToken cancellationToken = default)
    {
        if (!await HasCourseAccessAsync(courseId, userId, requiredPermission, cancellationToken))
            throw new ForbiddenAccessException();
    }

    public async Task EnsureOwnerAsync(
        int courseId, string userId,
        CancellationToken cancellationToken = default)
    {
        if (!await IsOwnerAsync(courseId, userId, cancellationToken))
            throw new ForbiddenAccessException();
    }

    private async Task<(bool isOwner, CoursePermission perms)> LoadAsync(
        int courseId, string userId, CancellationToken cancellationToken)
    {
        var key = (courseId, userId);
        if (_cache.TryGetValue(key, out var cached)) return cached;

        var course = await _context.Courses
            .AsNoTracking()
            .Where(c => c.Id == courseId)
            .Select(c => new { c.CreatedBy })
            .FirstOrDefaultAsync(cancellationToken);

        if (course is null)
        {
            _cache[key] = (false, CoursePermission.None);
            return _cache[key];
        }

        if (course.CreatedBy == userId)
        {
            _cache[key] = (true, CoursePermission.None);
            return _cache[key];
        }

        var collab = await _context.CourseCollaborators
            .AsNoTracking()
            .Where(c => c.CourseId == courseId
                     && c.UserId == userId
                     && c.InviteStatus == CollaboratorInviteStatus.Accepted)
            .Select(c => c.Permissions)
            .FirstOrDefaultAsync(cancellationToken);

        _cache[key] = (false, collab);
        return _cache[key];
    }
}
