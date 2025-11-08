using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Enrollments.Queries.GetCoursesByStudentIdQuery;
public class GetCoursesByStudentIdWithPaginationQuery : IRequest<PaginatedList<GetCoursesByStudentIdDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class GetCoursesByStudentIdWithPaginationQueryHandler : IRequestHandler<GetCoursesByStudentIdWithPaginationQuery, PaginatedList<GetCoursesByStudentIdDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public GetCoursesByStudentIdWithPaginationQueryHandler(IApplicationDbContext context, IMapper mapper, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<PaginatedList<GetCoursesByStudentIdDto>> Handle(GetCoursesByStudentIdWithPaginationQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;
        return await _context.Enrollments
            .Where(e => e.StudentId == userId)
            .Select(e => e.Course)
            .ProjectTo<GetCoursesByStudentIdDto>(_mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);
    }


}
