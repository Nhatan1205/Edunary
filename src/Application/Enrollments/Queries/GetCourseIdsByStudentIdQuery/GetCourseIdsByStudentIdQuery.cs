using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.Enrollments.Queries.GetCourseIdsByStudentIdQuery;
public class GetCourseIdsByStudentIdQuery : IRequest<List<GetCourseIdsByStudentIdDto>>
{
    public string StudentId { get; set; }
}

public class GetCourseIdsByStudentIdQueryHandler : IRequestHandler<GetCourseIdsByStudentIdQuery, List<GetCourseIdsByStudentIdDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    public GetCourseIdsByStudentIdQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }
    public async Task<List<GetCourseIdsByStudentIdDto>> Handle(GetCourseIdsByStudentIdQuery request, CancellationToken cancellationToken)
    {
        return await _context.Enrollments
            .Where(e => e.StudentId == request.StudentId)
            .Select(e => e.CourseId)
            .ProjectTo<GetCourseIdsByStudentIdDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
