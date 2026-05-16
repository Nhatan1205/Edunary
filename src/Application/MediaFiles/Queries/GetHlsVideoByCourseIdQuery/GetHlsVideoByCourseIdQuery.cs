using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;

namespace Edunary.Application.MediaFiles.Queries.GetHlsVideoByCourseIdQuery;

public class GetHlsVideoByCourseIdQuery : IRequest<List<HlsVideoCaptionDto>>
{
    public int CourseId { get; set; }
    public int Language { get; set; }
}
public class GetHlsVideoByCourseIdQueryHandler : IRequestHandler<GetHlsVideoByCourseIdQuery, List<HlsVideoCaptionDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public GetHlsVideoByCourseIdQueryHandler(
        IApplicationDbContext context, 
        IMapper mapper, 
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }
    public async Task<List<HlsVideoCaptionDto>> Handle(GetHlsVideoByCourseIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;

        bool hasAccess = await _courseAuth.HasCourseAccessAsync(request.CourseId, userId, CoursePermission.View, cancellationToken);
        if (!hasAccess) return new List<HlsVideoCaptionDto>();

        var result = await _context.MediaFiles
                    .Where(m => m.CourseId == request.CourseId && !m.IsDeleted && m.HlsStatus == VideoStatus.READY)
                    .Select( m => new
                    {
                        Media = m,
                        Caption = m.VideoCaptions
                                .Where(vc => vc.Language == (Languages)request.Language
                                          && !vc.IsSourceTranscript)
                                .FirstOrDefault()
                    })
                    .Select(x => new HlsVideoCaptionDto
                    {
                        VideoId = x.Media.Id,
                        VideoTitle = x.Media.FileName,
                        CaptionId = x.Caption != null ? (int?)x.Caption.Id : null,
                        CaptionFileName = x.Caption != null ? x.Caption.FileName : null,
                        UploadStatus = x.Caption != null ? x.Caption.Status : null
                    }).ToListAsync();
        return result;
    }
}
