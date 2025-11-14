using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.CourseContents.Queries.GetCourseContentByUserIdQuery;

public class GetCourseContentByUserId : IRequest<List<CourseContentDto>>
{
    
}
public class GetCourseContentByUserIdHandler : IRequestHandler<GetCourseContentByUserId, List<CourseContentDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public GetCourseContentByUserIdHandler(IApplicationDbContext context, IMapper mapper, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<List<CourseContentDto>> Handle(GetCourseContentByUserId request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;
        return await _context.CourseContents
            .Where(cc => cc.UserId == userId)
            .OrderByDescending(cc => cc.LastModified)
            .ProjectTo<CourseContentDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}