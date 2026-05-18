using System;
using System.Threading;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.MediaFiles.Queries.GetDownloadUrlQuery;

public class GetDownloadUrlQuery : IRequest<DownloadUrlDto>
{
    public int MediaFileId { get; set; }
}

public class GetDownloadUrlQueryHandler : IRequestHandler<GetDownloadUrlQuery, DownloadUrlDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IUploadFileService _uploadFileService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;

    public GetDownloadUrlQueryHandler(
        IApplicationDbContext context, 
        IUploadFileService uploadFileService,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _uploadFileService = uploadFileService;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
    }

    public async Task<DownloadUrlDto> Handle(GetDownloadUrlQuery request, CancellationToken cancellationToken)
    {
        var mediaFile = await _context.MediaFiles.FirstOrDefaultAsync(m => m.Id == request.MediaFileId, cancellationToken);
        if (mediaFile == null || string.IsNullOrEmpty(mediaFile.FileUrl))
        {
            return new DownloadUrlDto();
        }

        var userId = _currentUserService?.UserId;

        if (mediaFile.UserId != userId)
        {
            if (!mediaFile.CourseId.HasValue) 
                return new DownloadUrlDto();

            bool isEnrolled = await _context.Enrollments.AnyAsync(e => e.CourseId == mediaFile.CourseId.Value && e.StudentId == userId, cancellationToken);
            bool hasInstructorAccess = await _courseAuth.HasCourseAccessAsync(mediaFile.CourseId.Value, userId, CoursePermission.View, cancellationToken);

            if (!isEnrolled && !hasInstructorAccess)
            {
                return new DownloadUrlDto();
            }
        }

        // Form the S3 key from the known pattern: courses/{userId}/{fileName}
        string key = $"courses/{mediaFile.UserId}/{mediaFile.FileName}";

        string presignedUrl = await _uploadFileService.GeneratePresignedDownloadUrlAsync(key, mediaFile.FileName);
        var rs = new DownloadUrlDto()
        {
          Url = presignedUrl  
        };
        return rs;
    }
}
