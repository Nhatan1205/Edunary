using Edunary.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;

namespace Edunary.Application.Courses.Queries.GetCoursesWithPagination;
public record GetCoursesWithPaginationQuery : IRequest<PaginatedList<GetCourseDto>>
{
    public string SearchText { get; init; }
    public CourseSortBy sortBy { get; init; }
    public List<FilterData> FilterData { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class GetCoursesWithPaginationQueryHandler : IRequestHandler<GetCoursesWithPaginationQuery, PaginatedList<GetCourseDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IFilterService _filterService;
    private readonly IIdentityService _identityService;
    private readonly ICurrentUserService _currentUserService;

    public GetCoursesWithPaginationQueryHandler(IApplicationDbContext context, IMapper mapper, IFilterService filterService, IIdentityService identityService, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _filterService = filterService;
        _identityService = identityService;
        _currentUserService = currentUserService;
    }

    public async Task<PaginatedList<GetCourseDto>> Handle(GetCoursesWithPaginationQuery request, CancellationToken cancellationToken)
    {
        // base query
        var query = _context.Courses.AsQueryable();

        // sort courses
        switch (request.sortBy)
        {
            case CourseSortBy.Newest:
                query = query.OrderByDescending(x => x.Created);
                break;

            case CourseSortBy.Popular:
                query = query.OrderByDescending(x => x.TotalStudents);
                break;

            case CourseSortBy.TopRated:
                query = query.OrderByDescending(x => x.Ratings);
                break;

            case CourseSortBy.Relevant:
            default:
                query = query.OrderBy(x => x.Title);
                break;
        }

        // search courses based on title and subtitle
        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            string search = request.SearchText.Trim().ToLower();
            query = query.Where(c =>
                c.Title.ToLower().Contains(search) ||
                c.Subtitle.ToLower().Contains(search)
            );
        }

        //filter courses
        query = _filterService.HandleFilters(query, request.FilterData);

        //get all courses by pagination
        PaginatedList<GetCourseDto> courses = await query
            .ProjectTo<GetCourseDto>(_mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);

        //add instructor name
        var instructorIds = courses.Items
            .Select(c => c.CreatedBy)
            .Where(id => !string.IsNullOrEmpty(id))
            .Distinct()
            .ToList();
        var instructorNames = new Dictionary<string, string>();
        foreach (var instructorId in instructorIds)
        {
            var name = await _identityService.GetFullNameAsync(instructorId);
            instructorNames[instructorId] = name;
        }
        foreach (var course in courses.Items)
        {
            if (!string.IsNullOrEmpty(course.CreatedBy) &&
                instructorNames.ContainsKey(course.CreatedBy))
            {
                course.InstructorName = instructorNames[course.CreatedBy];
            }
        }

        // set enrollment flags for current user (if authenticated)
        var userId = _currentUserService?.UserId;
        if (!string.IsNullOrEmpty(userId))
        {
            var courseIds = courses.Items.Select(c => c.Id).ToList();
            var enrolledIds = await _context.Enrollments
                .Where(e => e.StudentId == userId && courseIds.Contains(e.CourseId))
                .Select(e => e.CourseId)
                .ToListAsync(cancellationToken);

            var enrolledIdSet = enrolledIds.ToHashSet();
            foreach (var course in courses.Items)
            {
                course.IsEnrolled = enrolledIdSet.Contains(course.Id);
            }
        }

        return courses;
    }
}
