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
    public GetCourseByIdQueryHandler(IApplicationDbContext context, IMapper mapper, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }
    public async Task<GetCourseByIdDto> Handle(GetCourseByIdQuery request, CancellationToken cancellationToken)
    {
    
        var userId = _currentUserService?.UserId;
        return await _context.Courses
            .Where(c => c.Id == request.Id && c.CreatedBy == userId)
            .ProjectTo<GetCourseByIdDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);

    }
}
