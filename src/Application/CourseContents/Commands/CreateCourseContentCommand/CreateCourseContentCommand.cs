using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.CourseContents.Queries.GetCourseContentByUserIdQuery;
using Edunary.Domain.Entities;

namespace Edunary.Application.CourseContents.Commands.CreateCourseContentCommand;

public class CreateCourseContentCommand : IRequest<ReturnResult<CourseContentDto>>
{
    public Stream File { get; set; }
    public string FileName { get; set; }
    public string ContentType { get; set; }
    public bool IsOverride { get; set; }
    public int? CourseId { get; set; }
}

public class CreateCourseContentCommandHandler : IRequestHandler<CreateCourseContentCommand, ReturnResult<CourseContentDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUploadFileService _uploadFileService;
    private readonly IMapper _mapper;

    public CreateCourseContentCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IUploadFileService uploadFileService,
        IMapper mapper)
    {
        _context = context;
        _currentUserService = currentUserService;
        _uploadFileService = uploadFileService;
        _mapper = mapper;
    }

    public async Task<ReturnResult<CourseContentDto>> Handle(CreateCourseContentCommand request, CancellationToken cancellationToken)
    {
        var result = new ReturnResult<CourseContentDto>();
        var userId = _currentUserService?.UserId;
        var fileUrl = string.Empty;
        CourseContent savedContent;
        var existingFile = await _context.CourseContents
            .FirstOrDefaultAsync(cc => cc.FileName == request.FileName && cc.UserId == userId && cc.ContentType == request.ContentType && cc.IsDeleted == false, cancellationToken);
        if (request.IsOverride && existingFile != null)
        {
            fileUrl = await _uploadFileService.UploadFileToSpacesAsync(request.File, request.FileName, request.ContentType);
            existingFile.FileUrl = fileUrl;
            existingFile.CourseId = request.CourseId;
            _context.CourseContents.Update(existingFile);
            savedContent = existingFile;
        }
        else
        {
            var baseFileName = Path.GetFileNameWithoutExtension(request.FileName);
            var extension = Path.GetExtension(request.FileName);
            var newFileName = request.FileName;
            var count = 1;
            var existingFileNames = await _context.CourseContents
            .Where(cc => cc.FileName.StartsWith(baseFileName) && cc.UserId == userId && cc.ContentType == request.ContentType && cc.IsDeleted == false)
            .Select(cc => cc.FileName)
            .ToHashSetAsync(cancellationToken);

            while (existingFileNames.Contains(newFileName))
            {
                newFileName = $"{baseFileName}({count}){extension}";
                count++;
            }

            fileUrl = await _uploadFileService.UploadFileToSpacesAsync(request.File, newFileName, request.ContentType);
            var courseContent = new CourseContent
            {
                FileName = newFileName,
                FileUrl = fileUrl,
                ContentType = request.ContentType,
                UserId = userId,
                CourseId = request.CourseId,
            };

            _context.CourseContents.Add(courseContent);
            savedContent = courseContent;
        }
        var saveResult = await _context.SaveChangesAsync(cancellationToken);
        if (saveResult > 0)
        {
            result.Message = "File uploaded successfully.";
            result.Result = _mapper.Map<CourseContentDto>(savedContent);
        }
        else
        {
            result.Message = "File upload failed.";
        }
        return result;
    }
}