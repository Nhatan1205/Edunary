using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.Courses.Queries.GetPublicCourseById;

public class GetPublicCourseByIdQuery : IRequest<GetPublicCourseByIdDto>
{
    public int Id { get; init; }
}

public class GetPublicCourseByIdQueryHandler : IRequestHandler<GetPublicCourseByIdQuery, GetPublicCourseByIdDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IIdentityService _identityService;

    public GetPublicCourseByIdQueryHandler(IApplicationDbContext context, IMapper mapper, IIdentityService identityService)
    {
        _context = context;
        _mapper = mapper;
        _identityService = identityService;
    }

    public async Task<GetPublicCourseByIdDto> Handle(GetPublicCourseByIdQuery request, CancellationToken cancellationToken)
    {
        var course = await _context.Courses
            .Include(c => c.Category)
            .Where(c => c.Id == request.Id)
            .ProjectTo<GetPublicCourseByIdDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);
        if (course == null) return null!;
        course.InstructorName = await _identityService.GetFullNameAsync(course.CreatedBy);
        return course;
    }
}
