using System.Text.Json;
using Ardalis.GuardClauses;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.CourseProgresses.Commands.UpdateCourseProgressCommand;
using Edunary.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Enrollments.Queries.GetInstructorStudentDetailQuery;

public record GetInstructorStudentDetailQuery(string StudentId) : IRequest<InstructorStudentDetailDto>;

public class GetInstructorStudentDetailQueryHandler : IRequestHandler<GetInstructorStudentDetailQuery, InstructorStudentDetailDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;

    public GetInstructorStudentDetailQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IIdentityService identityService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _identityService = identityService;
    }

    public async Task<InstructorStudentDetailDto> Handle(
        GetInstructorStudentDetailQuery request,
        CancellationToken cancellationToken)
    {
        var instructorId = _currentUserService.UserId;

        // 1. Enrollments of this student in courses the caller can access (owned OR Performance collaborator)
        var enrollments = await _context.Enrollments
            .Where(e => e.StudentId == request.StudentId &&
                        (e.Course.CreatedBy == instructorId ||
                         e.Course.Collaborators.Any(cc =>
                             cc.UserId == instructorId &&
                             cc.InviteStatus == CollaboratorInviteStatus.Accepted &&
                             cc.Permissions.HasFlag(CoursePermission.Performance))))
            .Select(e => new
            {
                e.CourseId,
                CourseTitle = e.Course.Title,
                CourseImageUrl = e.Course.ImageUrl,
                EnrolledDate = e.Created,
            })
            .ToListAsync(cancellationToken);

        Guard.Against.NullOrEmpty(enrollments, nameof(enrollments),
            "Student is not enrolled in any of your courses.");

        var enrolledCourseIds = enrollments.Select(e => e.CourseId).ToList();

        // 2. Batch fetch user info (single query)
        var users = await _identityService.GetUserIdentitiesByIdsAsync(
            new List<string> { request.StudentId }, cancellationToken);
        var user = users.FirstOrDefault();

        // 3. Progress records for all enrolled courses in one query
        var progressRecords = await _context.CourseProgress
            .Where(p => p.StudentId == request.StudentId
                     && enrolledCourseIds.Contains(p.CourseId))
            .Select(p => new { p.CourseId, p.Progress, p.LastModified })
            .ToListAsync(cancellationToken);
        var progressMap = progressRecords.ToDictionary(p => p.CourseId);

        // 4. Last active = most recent progress update across all courses
        var lastActiveDate = progressMap.Any()
            ? progressMap.Values.Max(p => p.LastModified)
            : enrollments.Max(e => e.EnrolledDate);

        // 5. Map courses
        var courseDetails = enrollments.Select(e =>
        {
            progressMap.TryGetValue(e.CourseId, out var prog);
            var (completed, total) = ParseProgress(prog?.Progress);

            return new InstructorStudentCourseDetailDto
            {
                CourseId = e.CourseId,
                CourseTitle = e.CourseTitle,
                CourseImageUrl = e.CourseImageUrl,
                EnrolledDate = e.EnrolledDate,
                CompletedItems = completed,
                TotalItems = total,
            };
        }).ToList();

        return new InstructorStudentDetailDto
        {
            StudentId = request.StudentId,
            FullName = user?.FullName ?? "Unknown",
            Email = user?.Email ?? string.Empty,
            Avatar = user?.Avatar,
            LastActiveDate = lastActiveDate,
            Courses = courseDetails,
        };
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
