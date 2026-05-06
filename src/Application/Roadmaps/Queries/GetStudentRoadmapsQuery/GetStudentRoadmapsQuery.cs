using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;

namespace Edunary.Application.Roadmaps.Queries.GetStudentRoadmapsQuery;

public class GetStudentRoadmapsQuery : IRequest<PaginatedList<StudentRoadmapDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class GetStudentRoadmapsQueryHandler : IRequestHandler<GetStudentRoadmapsQuery, PaginatedList<StudentRoadmapDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public GetStudentRoadmapsQueryHandler(
        IApplicationDbContext context,
        IMapper mapper,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<PaginatedList<StudentRoadmapDto>> Handle(GetStudentRoadmapsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;

        return await _context.Roadmaps
            .Where(r => r.CreatedBy == userId && r.Source == RoadmapSource.AIGenerated)
            .OrderByDescending(r => r.Created)
            .ProjectTo<StudentRoadmapDto>(_mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);
    }
}
