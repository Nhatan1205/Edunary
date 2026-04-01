using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.MediaFiles.Commands.InitiateChunkedUploadCommand;

public class InitiateChunkedUploadCommand : IRequest<UploadSessionDto>
{
    public string FileName { get; set; }
    public long FileSize { get; set; }
    public int ChunkSize { get; set; }
    public int TotalChunks { get; set; }
    public string FileHash { get; set; }
    public string ContentType { get; set; }
    public int? CourseId { get; set; }
}

public class InitiateChunkedUploadCommandHandler : IRequestHandler<InitiateChunkedUploadCommand, UploadSessionDto>
{
    private readonly IChunkedUploadService _chunkedUploadService;
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public InitiateChunkedUploadCommandHandler(
        IChunkedUploadService chunkedUploadService,
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _chunkedUploadService = chunkedUploadService;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<UploadSessionDto> Handle(InitiateChunkedUploadCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;
        
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

        var result = await _chunkedUploadService.InitiateUpload(initiateRequest);
        return result;
    }
}
