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
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public GetCaptionLanguageQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }
    public async Task<List<int>> Handle(GetCaptionLanguageQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;

        bool hasAccess = await _courseAuth.HasCourseAccessAsync(request.CourseId, userId, cancellationToken: cancellationToken);
        if (!hasAccess)
            return new List<int>();

        var languages = await _context.MediaFiles
            .Where(m => m.CourseId == request.CourseId && !m.IsDeleted)
            .SelectMany(m => m.VideoCaptions)
            .Where(vc => !vc.IsSourceTranscript)
            .Select(vc => (int)vc.Language)
            .Distinct()
            .ToListAsync(cancellationToken);

        return languages;
    }
}
