using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;

namespace Edunary.Application.VideoCaptions.Queries.GetVideoCaptionsByMediaFileId;

public record GetVideoCaptionsByMediaFileIdQuery : IRequest<List<VideoCaptionDto>>
{
    public int MediaFileId { get; init; }
}

public class GetVideoCaptionsByMediaFileIdQueryHandler : IRequestHandler<GetVideoCaptionsByMediaFileIdQuery, List<VideoCaptionDto>>
{
    private readonly IApplicationDbContext _context;

    public GetVideoCaptionsByMediaFileIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<VideoCaptionDto>> Handle(GetVideoCaptionsByMediaFileIdQuery request, CancellationToken cancellationToken)
    {
        return await _context.VideoCaptions
            .Where(vc => vc.MediaFileId == request.MediaFileId && vc.Status == CaptionStatus.COMPLETED)
            .Select(vc => new VideoCaptionDto
            {
                Id = vc.Id,
                Language = (int)vc.Language,
                FileUrl = vc.FileUrl,
                FileName = vc.FileName
            })
            .ToListAsync(cancellationToken);
    }
}
