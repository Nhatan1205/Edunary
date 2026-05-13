using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.VideoCaptions.Queries.GetCaptionLanguageQuery;

public class GetCaptionLanguageQuery : IRequest<List<int>>
{
    public int CourseId { get; set;}
}
public class GetCaptionLanguageQueryHandler : IRequestHandler<GetCaptionLanguageQuery, List<int>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public GetCaptionLanguageQueryHandler(IApplicationDbContext context, IMapper mapper, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }
    public async Task<List<int>> Handle(GetCaptionLanguageQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;
        var languages = await _context.MediaFiles
            .Where(m => m.CourseId == request.CourseId && 
                        !m.IsDeleted && 
                        m.UserId == userId)
            .SelectMany(m => m.VideoCaptions)
            .Where(vc => !vc.IsSourceTranscript)
            .Select(vc => (int)vc.Language)   
            .Distinct()           
            .ToListAsync(cancellationToken);

        return languages;
    }
}
