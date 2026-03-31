using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.MediaFiles.Queries.GetMediaFileByUserIdQuery;

public class GetMediaFileByUserId : IRequest<List<MediaFileDto>>
{
    
}
public class GetMediaFileByUserIdHandler : IRequestHandler<GetMediaFileByUserId, List<MediaFileDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public GetMediaFileByUserIdHandler(IApplicationDbContext context, IMapper mapper, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<List<MediaFileDto>> Handle(GetMediaFileByUserId request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;
        return await _context.MediaFiles
            .Where(cc => cc.UserId == userId && cc.IsDeleted == false)
            .OrderByDescending(cc => cc.LastModified)
            .ProjectTo<MediaFileDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}