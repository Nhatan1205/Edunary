using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Enrollments.Queries.GetInstructorRecentStudentsQuery;

public record GetInstructorRecentStudentsQuery : IRequest<InstructorRecentStudentsDto>;

public class GetInstructorRecentStudentsQueryHandler
    : IRequestHandler<GetInstructorRecentStudentsQuery, InstructorRecentStudentsDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;

    public GetInstructorRecentStudentsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IIdentityService identityService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _identityService = identityService;
    }

    public async Task<InstructorRecentStudentsDto> Handle(
        GetInstructorRecentStudentsQuery request,
        CancellationToken cancellationToken)
    {
        var instructorId = _currentUserService.UserId;

        // Courses owned by OR collaborated on with Performance permission
        var instructorCourseIds = await _context.Courses
            .Where(c => c.CreatedBy == instructorId ||
                        c.Collaborators.Any(cc =>
                            cc.UserId == instructorId &&
                            cc.InviteStatus == CollaboratorInviteStatus.Accepted &&
                            cc.Permissions.HasFlag(CoursePermission.Performance)))
            .Select(c => c.Id)
            .ToListAsync(cancellationToken);

        if (!instructorCourseIds.Any())
        {
            return new InstructorRecentStudentsDto();
        }

        var totalStudents = await _context.Enrollments
            .Where(e => instructorCourseIds.Contains(e.CourseId))
            .Select(e => e.StudentId)
            .Distinct()
            .CountAsync(cancellationToken);

        // 10 most recent enrollments with course title joined at DB
        var recentEnrollments = await _context.Enrollments
            .Where(e => instructorCourseIds.Contains(e.CourseId))
            .OrderByDescending(e => e.Created)
            .Take(10)
            .Select(e => new
            {
                e.StudentId,
                CourseTitle = e.Course.Title,
                e.Created,
            })
            .ToListAsync(cancellationToken);

        if (!recentEnrollments.Any())
        {
            return new InstructorRecentStudentsDto { TotalStudents = totalStudents };
        }

        // Batch fetch user info — single query, no N+1
        var studentIds = recentEnrollments.Select(e => e.StudentId).Distinct().ToList();
        var users = await _identityService.GetUserIdentitiesByIdsAsync(studentIds, cancellationToken);
        var userMap = users.ToDictionary(u => u.Id);

        var students = recentEnrollments.Select(e =>
        {
            userMap.TryGetValue(e.StudentId, out var user);
            return new InstructorRecentStudentDto
            {
                StudentId = e.StudentId,
                FullName = user?.FullName ?? "Unknown",
                Avatar = user?.Avatar,
                CourseTitle = e.CourseTitle,
                EnrolledDate = e.Created,
            };
        }).ToList();

        return new InstructorRecentStudentsDto
        {
            TotalStudents = totalStudents,
            Students = students,
        };
    }
}
