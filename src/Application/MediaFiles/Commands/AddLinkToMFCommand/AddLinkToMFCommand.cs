using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.MediaFiles.Queries.GetMediaFileByUserIdQuery;
using Edunary.Domain.Entities;

namespace Edunary.Application.MediaFiles.Commands.AddLinkToMFCommand;

public class AddLinkToMFCommand : IRequest<ReturnResult<MediaFileDto>>
{
    public string Title { get; set; }
    public string Url { get; set; }
    public string ContentType { get; set; }
    public bool IsOverride { get; set; }
    public int? CourseId { get; set; }
}
public class AddLinkToMFCommandHandler : IRequestHandler<AddLinkToMFCommand, ReturnResult<MediaFileDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public AddLinkToMFCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IMapper mapper)
    {
        _context = context;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<ReturnResult<MediaFileDto>> Handle(AddLinkToMFCommand request, CancellationToken cancellationToken)
    {
        var result = new ReturnResult<MediaFileDto>();
        var userId = _currentUserService?.UserId;

        MediaFile savedContent;
        var existingLink = await _context.MediaFiles
            .FirstOrDefaultAsync(cc => cc.FileUrl == request.Url && cc.UserId == userId && cc.ContentType == request.ContentType, cancellationToken);
        if (request.IsOverride && existingLink != null)
        {
            existingLink.FileName = request.Title;
            existingLink.CourseId = request.CourseId;
            existingLink.FileUrl = request.Url;
            _context.MediaFiles.Update(existingLink);
            savedContent = existingLink;
        }
        else
        {
            var baseTitle = request.Title.Trim();
            var newTitle = request.Title.Trim();
            var count = 1;
            var existingTitles = await _context.MediaFiles
                .Where(cc => cc.FileName.StartsWith(baseTitle) && 
                            cc.UserId == userId && 
                            cc.ContentType == request.ContentType) 
                .Select(cc => cc.FileName)
                .ToHashSetAsync(cancellationToken);

            while (existingTitles.Contains(newTitle))
            {
                newTitle = $"{baseTitle}({count})";
                count++;
            }
            var linkContent = new MediaFile
            {
                FileName = newTitle,
                FileUrl = request.Url,
                ContentType = request.ContentType,
                UserId = userId,
                CourseId = request.CourseId
            };
            _context.MediaFiles.Add(linkContent);
            savedContent = linkContent;
        }
        var saveResult = await _context.SaveChangesAsync(cancellationToken);
        if (saveResult > 0)
        {
            result.Message = "Link added successfully.";
            result.Result = _mapper.Map<MediaFileDto>(savedContent);
        }
        else
        {
            result.Message = "Failed to add link.";
        }
        return result;
    }
}
