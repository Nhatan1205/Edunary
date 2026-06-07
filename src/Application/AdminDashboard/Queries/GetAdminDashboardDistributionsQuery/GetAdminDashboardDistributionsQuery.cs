using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.AdminDashboard.Queries.GetAdminDashboardDistributionsQuery;

public record GetAdminDashboardDistributionsQuery : IRequest<AdminDashboardDistributionsDto>;

public class GetAdminDashboardDistributionsQueryHandler
    : IRequestHandler<GetAdminDashboardDistributionsQuery, AdminDashboardDistributionsDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public GetAdminDashboardDistributionsQueryHandler(
        IApplicationDbContext context,
        IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<AdminDashboardDistributionsDto> Handle(
        GetAdminDashboardDistributionsQuery request, CancellationToken cancellationToken)
    {
        // 1. Category comparison (top 10 by course count)
        var byCategory = await _context.Categories
            .Select(c => new DashboardCategoryComparisonItem
            {
                CategoryId = c.Id,
                Title = c.Title,
                CourseCount = c.Courses.Count(),
                EnrollmentCount = c.Courses.Sum(co => co.TotalStudents),
            })
            .OrderByDescending(c => c.CourseCount)
            .Take(10)
            .ToListAsync(cancellationToken);

        // 2. Topic comparison (top 10 by course count)
        var byTopic = await _context.Topics
            .Select(t => new DashboardTopicComparisonItem
            {
                TopicId = t.Id,
                Title = t.Name,
                CourseCount = t.Courses.Count(),
                EnrollmentCount = t.Courses.Sum(co => co.TotalStudents),
            })
            .OrderByDescending(t => t.CourseCount)
            .Take(10)
            .ToListAsync(cancellationToken);

        // 3. Popular courses by total students 
        var topCourses = await _context.Courses
            .OrderByDescending(c => c.TotalStudents)
            .Take(5)
            .Select(c => new TopCourseItem
            {
                CourseId    = c.Id,
                Title       = c.Title ?? string.Empty,
                Thumbnail   = c.ImageUrl ?? string.Empty,
                Enrollments = c.TotalStudents,
            })
            .ToListAsync(cancellationToken);

        // 4. Popular Instructors (top 5 by average course rating)
        var instructorRaw = await _context.Courses
            .GroupBy(c => c.CreatedBy)
            .Select(g => new
            {
                InstructorId = g.Key,
                CoursesCount = g.Count(),
                AvgRating = g.Average(c => (double)c.Ratings)
            })
            .OrderByDescending(x => x.AvgRating)
            .Take(5)
            .ToListAsync(cancellationToken);

        var popularInstructors = new List<PopularInstructorItem>();
        if (instructorRaw.Count > 0)
        {
            var instructorIds = instructorRaw.Select(x => x.InstructorId).ToList();
            var identities = await _identityService.GetUserIdentitiesByIdsAsync(instructorIds, cancellationToken);

            foreach (var raw in instructorRaw)
            {
                var identity = identities.Find(i => i.Id == raw.InstructorId);
                popularInstructors.Add(new PopularInstructorItem
                {
                    InstructorId = raw.InstructorId,
                    Name = identity?.FullName ?? string.Empty,
                    Avatar = identity?.Avatar ?? string.Empty,
                    Headline = identity?.Headline ?? string.Empty,
                    CoursesCount = raw.CoursesCount,
                    AvgRating = raw.AvgRating,
                });
            }
        }

        return new AdminDashboardDistributionsDto
        {
            ByCategory = byCategory,
            ByTopic    = byTopic,
            TopCourses = topCourses,
            PopularInstructors = popularInstructors,
        };
    }
}
