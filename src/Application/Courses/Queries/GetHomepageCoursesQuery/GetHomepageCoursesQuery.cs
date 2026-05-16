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
        if (instructorIds.Any())
        {
            var creatorIdentities = await _identityService.GetUserIdentitiesByIdsAsync(instructorIds, cancellationToken);
            foreach (var identity in creatorIdentities)
            {
                instructorNames[identity.Id] = identity.FullName;
            }
        }

        var courseIds = allCourses.Select(c => c.Id).Distinct().ToList();
        var visibleCollabs = await _context.CourseCollaborators
            .Where(c => courseIds.Contains(c.CourseId) && c.IsVisible && c.InviteStatus == CollaboratorInviteStatus.Accepted)
            .ToListAsync(cancellationToken);

        var collabUserIds = visibleCollabs.Select(c => c.UserId).Distinct().ToList();
        var collabNames = new Dictionary<string, string>();

        if (collabUserIds.Any())
        {
            var collabIdentities = await _identityService.GetUserIdentitiesByIdsAsync(collabUserIds, cancellationToken);
            foreach (var identity in collabIdentities)
            {
                collabNames[identity.Id] = identity.FullName;
            }
        }

        void AssignInstructorNames(IEnumerable<GetHomepageCoursesDto> courses)
        {
            foreach (var course in courses)
            {
                var ownerName = "Unknown";
                if (!string.IsNullOrEmpty(course.CreatedBy) &&
                    instructorNames.ContainsKey(course.CreatedBy))
                {
                    ownerName = instructorNames[course.CreatedBy];
                }

                var courseCollabs = visibleCollabs.Where(c => c.CourseId == course.Id).ToList();
                var collabsString = string.Join(", ", courseCollabs.Select(c => collabNames.GetValueOrDefault(c.UserId, "")).Where(n => !string.IsNullOrEmpty(n)));
                course.InstructorName = string.IsNullOrEmpty(collabsString) ? ownerName : $"{ownerName}, {collabsString}";
            }
        }

        AssignInstructorNames(popularCourses);
        AssignInstructorNames(newCourses);
        AssignInstructorNames(topRatedCourses);

        return new HomepageCoursesVm
        {
            PopularCourses = popularCourses,
            NewCourses = newCourses,
            TopRatedCourses = topRatedCourses
        };
    }
}
