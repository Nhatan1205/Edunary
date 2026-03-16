using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Courses.Queries.GetPublicCoursesByUserIdQuery;

public class GetPublicCoursesByUserIdQuery : IRequest<PaginatedList<PublicCoursesByUserIdDto>>
{
    public string UserId { get; set; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class GetPublicCoursesByUserIdQueryHandler
    : IRequestHandler<GetPublicCoursesByUserIdQuery, PaginatedList<PublicCoursesByUserIdDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetPublicCoursesByUserIdQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PaginatedList<PublicCoursesByUserIdDto>> Handle(GetPublicCoursesByUserIdQuery request,CancellationToken cancellationToken)
    {
        var courses = await _context.Courses
            .Where(c => c.CreatedBy == request.UserId)
            .OrderByDescending(c => c.Created)
            .ProjectTo<PublicCoursesByUserIdDto>(_mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);
        return courses;
    }
}
