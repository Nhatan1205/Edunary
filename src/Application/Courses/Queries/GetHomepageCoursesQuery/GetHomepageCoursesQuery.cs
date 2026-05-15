using Edunary.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Edunary.Application.Courses.Queries.GetHomepageCoursesQuery;
using Edunary.Domain.Enums;

namespace Edunary.Application.Courses.Queries.GetCoursesHomepageQuery;

public record GetHomepageCoursesQuery : IRequest<HomepageCoursesVm>, ICacheableQuery
{
    public string UserId { get; init; }

    public string CacheKey => string.IsNullOrEmpty(UserId)
        ? "homepage:courses:guest"
        : $"homepage:courses:user:{UserId}";

    public TimeSpan CacheDuration => TimeSpan.FromHours(24);
}

public class GetHomepageCoursesQueryHandler : IRequestHandler<GetHomepageCoursesQuery, HomepageCoursesVm>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IIdentityService _identityService;

    public GetHomepageCoursesQueryHandler(
        IApplicationDbContext context,
        IMapper mapper,
        IIdentityService identityService)
    {
        _context = context;
        _mapper = mapper;
        _identityService = identityService;
    }

    public async Task<HomepageCoursesVm> Handle(GetHomepageCoursesQuery request, CancellationToken cancellationToken)
    {
        var userId = request.UserId;
        var query = _context.Courses.Where(c => c.Status == CourseStatus.Public).AsQueryable();

        if (!string.IsNullOrEmpty(userId))
        {
            query = query.Where(c => !_context.Enrollments.Any(e => e.StudentId == userId && e.CourseId == c.Id));
        }

        // Popular courses
        var popularCourses = await query
            .OrderByDescending(c => c.TotalStudents)
            .ThenBy(c => c.Title)
            .Take(8)
            .ProjectTo<GetHomepageCoursesDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        // New courses
        var newCourses = await query
            .OrderByDescending(c => c.Created)
            .ThenBy(c => c.Title)
            .Take(4)
            .ProjectTo<GetHomepageCoursesDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        // Top rated courses
        var topRatedCourses = await query
            .OrderByDescending(c => c.Ratings)
            .ThenBy(c => c.Title)
            .Take(8)
            .ProjectTo<GetHomepageCoursesDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        var allCourses = popularCourses.Concat(newCourses).Concat(topRatedCourses);
        var instructorIds = allCourses
            .Select(c => c.CreatedBy)
            .Where(id => !string.IsNullOrEmpty(id))
            .Distinct()
            .ToList();

        // Fetch instructor names
        var instructorNames = new Dictionary<string, string>();
        foreach (var instructorId in instructorIds)
        {
            var name = await _identityService.GetFullNameAsync(instructorId);
            instructorNames[instructorId] = name;
        }

        // Add instructor names to popular courses
        foreach (var course in popularCourses)
        {
            if (!string.IsNullOrEmpty(course.CreatedBy) &&
                instructorNames.ContainsKey(course.CreatedBy))
            {
                course.InstructorName = instructorNames[course.CreatedBy];
            }
        }

        // Add instructor names to new courses
        foreach (var course in newCourses)
        {
            if (!string.IsNullOrEmpty(course.CreatedBy) &&
                instructorNames.ContainsKey(course.CreatedBy))
            {
                course.InstructorName = instructorNames[course.CreatedBy];
            }
        }

        // Add instructor names to top rated courses
        foreach (var course in topRatedCourses)
        {
            if (!string.IsNullOrEmpty(course.CreatedBy) &&
                instructorNames.ContainsKey(course.CreatedBy))
            {
                course.InstructorName = instructorNames[course.CreatedBy];
            }
        }

        return new HomepageCoursesVm
        {
            PopularCourses = popularCourses,
            NewCourses = newCourses,
            TopRatedCourses = topRatedCourses
        };
    }
}
