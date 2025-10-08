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

    public GetPublicCourseByIdQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<GetPublicCourseByIdDto> Handle(GetPublicCourseByIdQuery request, CancellationToken cancellationToken)
    {
        return await _context.Courses
            .Include(c => c.Category)
            .Where(c => c.Id == request.Id)
            .ProjectTo<GetPublicCourseByIdDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);
    }
}