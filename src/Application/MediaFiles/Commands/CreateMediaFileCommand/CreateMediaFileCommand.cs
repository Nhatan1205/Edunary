using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.MediaFiles.Queries.GetMediaFileByUserIdQuery;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.MediaFiles.Commands.CreateMediaFileCommand;

public class CreateMediaFileCommand : IRequest<ReturnResult<MediaFileDto>>
{
    public Stream File { get; set; }
    public string FileName { get; set; }
    public string ContentType { get; set; }
    public bool IsOverride { get; set; }
    public int? CourseId { get; set; }
}

public class CreateMediaFileCommandHandler : IRequestHandler<CreateMediaFileCommand, ReturnResult<MediaFileDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUploadFileService _uploadFileService;
    private readonly IMapper _mapper;
    private readonly ICourseAuthorizationService _courseAuth;

    public CreateMediaFileCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IUploadFileService uploadFileService,
        IMapper mapper,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _currentUserService = currentUserService;
        _uploadFileService = uploadFileService;
        _mapper = mapper;
        _courseAuth = courseAuth;
    }

    public async Task<ReturnResult<MediaFileDto>> Handle(CreateMediaFileCommand request, CancellationToken cancellationToken)
    {
        var result = new ReturnResult<MediaFileDto>();
        var userId = _currentUserService?.UserId;

        if (request.CourseId.HasValue)
        {
            bool hasAccess = await _courseAuth.HasCourseAccessAsync(request.CourseId.Value, userId, CoursePermission.Manage, cancellationToken);
            if (!hasAccess)
            {
                result.Message = "You do not have Manage permissions for this course.";
                return result;
            }
        }

        var fileUrl = string.Empty;
        MediaFile savedContent;
        var existingFile = await _context.MediaFiles
            .FirstOrDefaultAsync(cc => cc.FileName == request.FileName && cc.UserId == userId && cc.ContentType == request.ContentType && cc.IsDeleted == false, cancellationToken);
        if (request.IsOverride && existingFile != null)
        {
            fileUrl = await _uploadFileService.UploadFileToSpacesAsync(request.File, request.FileName, request.ContentType);
            existingFile.FileUrl = fileUrl;
            existingFile.CourseId = request.CourseId;
            _context.MediaFiles.Update(existingFile);
            savedContent = existingFile;
        }
        else
        {
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

            fileUrl = await _uploadFileService.UploadFileToSpacesAsync(request.File, newFileName, request.ContentType);
            var courseContent = new MediaFile
            {
                FileName = newFileName,
                FileUrl = fileUrl,
                ContentType = request.ContentType,
                UserId = userId,
                CourseId = request.CourseId,
            };

            _context.MediaFiles.Add(courseContent);
            savedContent = courseContent;
        }
        var saveResult = await _context.SaveChangesAsync(cancellationToken);
        if (saveResult > 0)
        {
            result.Message = "File uploaded successfully.";
            result.Result = _mapper.Map<MediaFileDto>(savedContent);
        }
        else
        {
            result.Message = "File upload failed.";
        }
        return result;
    }
}