using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.MediaFiles.Commands.InitiateChunkedUploadCommand;

public class InitiateChunkedUploadCommand : IRequest<ReturnResult<UploadSessionDto>>
{
    public string FileName { get; set; }
    public long FileSize { get; set; }
    public int ChunkSize { get; set; }
    public int TotalChunks { get; set; }
    public string FileHash { get; set; }
    public string ContentType { get; set; }
    public int? CourseId { get; set; }
}

public class InitiateChunkedUploadCommandHandler : IRequestHandler<InitiateChunkedUploadCommand, ReturnResult<UploadSessionDto>>
{
    private readonly IChunkedUploadService _chunkedUploadService;
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public InitiateChunkedUploadCommandHandler(
        IChunkedUploadService chunkedUploadService,
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _chunkedUploadService = chunkedUploadService;
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<ReturnResult<UploadSessionDto>> Handle(InitiateChunkedUploadCommand request, CancellationToken cancellationToken)
    {
        var returnResult = new ReturnResult<UploadSessionDto>();
        var userId = _currentUserService?.UserId;
        
        if (request.CourseId.HasValue)
        {
            bool hasAccess = await _courseAuth.HasCourseAccessAsync(request.CourseId.Value, userId, CoursePermission.Manage, cancellationToken);
            if (!hasAccess)
            {
                returnResult.Message = "You do not have Manage permissions for this course.";
                return returnResult;
            }
        }
        // Check for existing files and generate unique name if needed
        var baseFileName = Path.GetFileNameWithoutExtension(request.FileName);
        var extension = Path.GetExtension(request.FileName);
        var newFileName = request.FileName;
        var count = 1;

        var existingFileNames = await _context.MediaFiles
            .Where(cc => cc.FileName.StartsWith(baseFileName) && cc.UserId == userId && cc.ContentType == request.ContentType && cc.IsDeleted == false)
            .Select(cc => cc.FileName)
            .ToHashSetAsync(cancellationToken);

        while (existingFileNames.Contains(newFileName))
        {
            newFileName = $"{baseFileName}({count}){extension}";
            count++;
        }

        var initiateRequest = new InitiateUploadRequest
        {
            FileName = newFileName,
            FileSize = request.FileSize,
            ChunkSize = request.ChunkSize,
            TotalChunks = request.TotalChunks,
            FileHash = request.FileHash,
            ContentType = request.ContentType,
            CourseId = (int)request.CourseId
        };

        var uploadResult = await _chunkedUploadService.InitiateUpload(initiateRequest);
        returnResult.Result = uploadResult;
        return returnResult;
    }
}
