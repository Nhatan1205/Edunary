using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;
using MediatR;

namespace Edunary.Application.VideoCaptions.Queries.GetVideoCaptionsByMediaFileId;

public record GetVideoCaptionsByMediaFileIdQuery : IRequest<List<VideoCaptionDto>>
{
    public int MediaFileId { get; init; }
}

public class GetVideoCaptionsByMediaFileIdQueryHandler : IRequestHandler<GetVideoCaptionsByMediaFileIdQuery, List<VideoCaptionDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ISender _sender;

    public GetVideoCaptionsByMediaFileIdQueryHandler(IApplicationDbContext context, ISender sender)
    {
        _context = context;
        _sender = sender;
    }

    public async Task<List<VideoCaptionDto>> Handle(GetVideoCaptionsByMediaFileIdQuery request, CancellationToken cancellationToken)
    {
        bool hasAccess = await _sender.Send(new Edunary.Application.MediaFiles.Queries.CheckMediaFileAccessQuery.CheckMediaFileAccessQuery
        {
            VideoId = request.MediaFileId
        }, cancellationToken);

        if (!hasAccess)
            return new List<VideoCaptionDto>();

        return await _context.VideoCaptions
            .Where(vc => vc.MediaFileId == request.MediaFileId
                      && vc.Status == CaptionStatus.COMPLETED
                      && !vc.IsSourceTranscript)
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
