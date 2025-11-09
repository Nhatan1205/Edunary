using Edunary.Application.Common.Interfaces;
using Edunary.Application.Courses.Queries.GetHomepageCoursesQuery;

namespace Edunary.Application.Courses.Queries.GetCoursesHomepageQuery;

public record GetHomepageCoursesQuery : IRequest<HomepageCoursesVm>;

public class GetHomepageCoursesQueryHandler : IRequestHandler<GetHomepageCoursesQuery, HomepageCoursesVm>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetHomepageCoursesQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
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

        return new HomepageCoursesVm
        {
            PopularCourses = popularCourses,
            NewCourses = newCourses,
            TopRatedCourses = topRatedCourses
        };
    }
}
