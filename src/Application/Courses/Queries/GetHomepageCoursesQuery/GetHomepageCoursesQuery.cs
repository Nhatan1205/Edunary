using Edunary.Application.Common.Interfaces;
using Edunary.Application.Courses.Queries.GetHomepageCoursesQuery;

namespace Edunary.Application.Courses.Queries.GetCoursesHomepageQuery;

public record GetHomepageCoursesQuery : IRequest<HomepageCoursesVm>;

public class GetHomepageCoursesQueryHandler : IRequestHandler<GetHomepageCoursesQuery, HomepageCoursesVm>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IIdentityService _identityService;

    public GetHomepageCoursesQueryHandler(IApplicationDbContext context, IMapper mapper, IIdentityService identityService)
    {
        _context = context;
        _mapper = mapper;
        _identityService = identityService;
    }

    public async Task<HomepageCoursesVm> Handle(GetHomepageCoursesQuery request, CancellationToken cancellationToken)
    {
        // Popular courses
        var popularCourses = await _context.Courses
            .OrderByDescending(c => c.TotalStudents)
            .ThenBy(c => c.Title)
            .Take(8)
            .ProjectTo<GetHomepageCoursesDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        // New courses
        var newCourses = await _context.Courses
            .OrderByDescending(c => c.Created)
            .ThenBy(c => c.Title)
            .Take(4)
            .ProjectTo<GetHomepageCoursesDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        // Top rated courses
        var topRatedCourses = await _context.Courses
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
