using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Courses.Queries.GetCourseById;
public class GetCourseByIdQuery : IRequest<GetCourseByIdDto>
{
    public int Id { get; init; }
}

public class GetCourseByIdQueryHandler : IRequestHandler<GetCourseByIdQuery, GetCourseByIdDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuthService;

    public GetCourseByIdQueryHandler(IApplicationDbContext context, IMapper mapper, ICurrentUserService currentUserService, ICourseAuthorizationService courseAuthService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
        _courseAuthService = courseAuthService;
    }
    public async Task<GetCourseByIdDto> Handle(GetCourseByIdQuery request, CancellationToken cancellationToken)
    {
    
        var userId = _currentUserService?.UserId;
        if (!await _courseAuthService.HasCourseAccessAsync(request.Id, userId, Edunary.Domain.Enums.CoursePermission.None, cancellationToken))
        {
            return null;
        }

        return await _context.Courses
            .Where(c => c.Id == request.Id)
            .ProjectTo<GetCourseByIdDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);

    }
}
