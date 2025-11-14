using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.CourseContents.Queries.GetCourseContentByUserIdQuery;
using Edunary.Domain.Entities;

namespace Edunary.Application.CourseContents.Commands.AddLinkToCCCommand;

public class AddLinkToCCCommand : IRequest<ReturnResult<CourseContentDto>>
{
    public string Title { get; set; }
    public string Url { get; set; }
    public string ContentType { get; set; }
    public bool IsOverride { get; set; }
    public int? CourseId { get; set; }
}
public class AddLinkToCCCommandHandler : IRequestHandler<AddLinkToCCCommand, ReturnResult<CourseContentDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public AddLinkToCCCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IMapper mapper)
    {
        _context = context;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<ReturnResult<CourseContentDto>> Handle(AddLinkToCCCommand request, CancellationToken cancellationToken)
    {
        var result = new ReturnResult<CourseContentDto>();
        var userId = _currentUserService?.UserId;

        CourseContent savedContent;
        var existingLink = await _context.CourseContents
            .FirstOrDefaultAsync(cc => cc.FileUrl == request.Url && cc.UserId == userId && cc.ContentType == request.ContentType, cancellationToken);
        if (request.IsOverride && existingLink != null)
        {
            existingLink.FileName = request.Title;
            existingLink.CourseId = request.CourseId;
            existingLink.FileUrl = request.Url;
            _context.CourseContents.Update(existingLink);
            savedContent = existingLink;
        }
        else
        {
            var linkContent = new CourseContent
            {
                FileName = request.Title,
                FileUrl = request.Url,
                ContentType = request.ContentType,
                UserId = userId,
                CourseId = request.CourseId
            };
            _context.CourseContents.Add(linkContent);
            savedContent = linkContent;
        }
        var saveResult = await _context.SaveChangesAsync(cancellationToken);
        if (saveResult > 0)
        {
            result.Message = "Link added successfully.";
            result.Result = _mapper.Map<CourseContentDto>(savedContent);
        }
        else
        {
            result.Message = "Failed to add link.";
        }
        return result;
    }
}
