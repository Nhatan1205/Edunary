using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Courses.Queries.GetEnrolledCoursesQuery;
public class GetEnrolledCoursesQuery : IRequest<PaginatedList<EnrolledCoursesDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}
public class GetEnrolledCoursesQueryHandler : IRequestHandler<GetEnrolledCoursesQuery, PaginatedList<EnrolledCoursesDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;

    public GetEnrolledCoursesQueryHandler(
        IApplicationDbContext context,
        IMapper mapper, 
        ICurrentUserService currentUserService,
        IIdentityService identityService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
        _identityService = identityService;
    }

    public async Task<PaginatedList<EnrolledCoursesDto>> Handle(GetEnrolledCoursesQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;
        PaginatedList<EnrolledCoursesDto> courses = await _context.Courses
            .Where(c => c.Enrollments.Any(e => e.StudentId == userId))
            .ProjectTo<EnrolledCoursesDto>(_mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);


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
        return courses;
    }
}