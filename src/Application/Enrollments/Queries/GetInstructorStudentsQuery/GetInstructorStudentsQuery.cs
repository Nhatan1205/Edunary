using System.Text.Json;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;
using Edunary.Application.CourseProgresses.Commands.UpdateCourseProgressCommand;
using Edunary.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Enrollments.Queries.GetInstructorStudentsQuery;

public record GetInstructorStudentsQuery : IRequest<PaginatedList<InstructorStudentDto>>
{
    public int? CourseId { get; init; }
    public string SortBy { get; init; } = "newest";
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class GetInstructorStudentsQueryHandler
    : IRequestHandler<GetInstructorStudentsQuery, PaginatedList<InstructorStudentDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;

    public GetInstructorStudentsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IIdentityService identityService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _identityService = identityService;
    }

    public async Task<PaginatedList<InstructorStudentDto>> Handle(
        GetInstructorStudentsQuery request,
        CancellationToken cancellationToken)
    {
        var instructorId = _currentUserService.UserId;

        // 1. Resolve accessible course IDs (owned OR collaborated with Performance permission)
        var coursesQuery = _context.Courses
            .Where(c => c.CreatedBy == instructorId ||
                        c.Collaborators.Any(cc =>
                            cc.UserId == instructorId &&
                            cc.InviteStatus == CollaboratorInviteStatus.Accepted &&
                            cc.Permissions.HasFlag(CoursePermission.Performance)));

        if (request.CourseId.HasValue)
        {
            coursesQuery = coursesQuery.Where(c => c.Id == request.CourseId.Value);
        }

        var instructorCourseIds = await coursesQuery
            .Select(c => c.Id)
            .ToListAsync(cancellationToken);

        if (!instructorCourseIds.Any())
        {
            return new PaginatedList<InstructorStudentDto>(
                new List<InstructorStudentDto>(), 0, request.PageNumber, request.PageSize);
        }

        // 2. Build enrollment query at DB — join course title, apply sort
        var enrollmentQuery = _context.Enrollments
            .Where(e => instructorCourseIds.Contains(e.CourseId));

        enrollmentQuery = request.SortBy switch
        {
            "name"     => enrollmentQuery.OrderBy(e => e.Course.Title),
            "progress" => enrollmentQuery.OrderByDescending(e =>
                              _context.CourseProgress
                                  .Where(p => p.StudentId == e.StudentId && p.CourseId == e.CourseId)
                                  .Select(p => p.LastModified)
                                  .FirstOrDefault()),
            _          => enrollmentQuery.OrderByDescending(e => e.Created), // newest
        };

        // 3. Paginate at DB
        var pagedEnrollments = await enrollmentQuery
            .Select(e => new
            {
                e.StudentId,
                e.CourseId,
                CourseTitle = e.Course.Title,
                EnrolledDate = e.Created,
            })
            .PaginatedListAsync(request.PageNumber, request.PageSize);

        if (!pagedEnrollments.Items.Any())
        {
            return new PaginatedList<InstructorStudentDto>(
                new List<InstructorStudentDto>(), pagedEnrollments.TotalCount,
                request.PageNumber, request.PageSize);
        }

        // 4. Batch fetch user info
        var studentIds = pagedEnrollments.Items.Select(e => e.StudentId).Distinct().ToList();
        var users = await _identityService.GetUserIdentitiesByIdsAsync(studentIds, cancellationToken);
        var userMap = users.ToDictionary(u => u.Id);

        // 5. Batch fetch progress for the current page's (studentId, courseId) pairs
        var courseIds = pagedEnrollments.Items.Select(e => e.CourseId).Distinct().ToList();
        var progressRecords = await _context.CourseProgress
            .Where(p => studentIds.Contains(p.StudentId) && courseIds.Contains(p.CourseId))
            .Select(p => new { p.StudentId, p.CourseId, p.Progress, p.LastModified })
            .ToListAsync(cancellationToken);
        var progressMap = progressRecords.ToDictionary(p => (p.StudentId, p.CourseId));

        // 6. Map to DTO
        var items = pagedEnrollments.Items.Select(e =>
        {
            userMap.TryGetValue(e.StudentId, out var user);
            progressMap.TryGetValue((e.StudentId, e.CourseId), out var prog);

            var (completed, total) = ParseProgress(prog?.Progress);

            return new InstructorStudentDto
            {
                StudentId = e.StudentId,
                FullName = user?.FullName ?? "Unknown",
                Email = user?.Email ?? string.Empty,
                Avatar = user?.Avatar,
                CourseId = e.CourseId,
                CourseTitle = e.CourseTitle,
                EnrolledDate = e.EnrolledDate,
                CompletedItems = completed,
                TotalItems = total,
                LastActiveDate = prog?.LastModified ?? e.EnrolledDate,
            };
        }).ToList();

        return new PaginatedList<InstructorStudentDto>(
            items, pagedEnrollments.TotalCount, request.PageNumber, request.PageSize);
    }

    private static (int Completed, int Total) ParseProgress(string progressJson)
    {
        if (string.IsNullOrEmpty(progressJson))
        {
            return (0, 0);
        }

        try
        {
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var schema = JsonSerializer.Deserialize<CourseContentSchema>(progressJson, options);
            if (schema?.Contents == null)
            {
                return (0, 0);
            }

            var allItems = schema.Contents.SelectMany(s => s.Items).ToList();
            return (allItems.Count(i => i.IsCompleted), allItems.Count);
        }
        catch
        {
            return (0, 0);
        }
    }
}
