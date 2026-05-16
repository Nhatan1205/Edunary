using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace Edunary.Application.MediaFiles.Queries.CheckMediaFileAccessQuery;

public class CheckMediaFileAccessQuery : IRequest<bool>
{
    public int VideoId { get; set; }
}

public class CheckMediaFileAccessQueryHandler : IRequestHandler<CheckMediaFileAccessQuery, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;
    private readonly ICourseAuthorizationService _courseAuth;

    public CheckMediaFileAccessQueryHandler(
        IApplicationDbContext context, 
        IUser user,
        ICourseAuthorizationService courseAuth)
    {
        _context = context;
        _user = user;
        _courseAuth = courseAuth;
    }

    public async Task<bool> Handle(CheckMediaFileAccessQuery request, CancellationToken cancellationToken)
    {
        var mediaFile = await _context.MediaFiles
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == request.VideoId, cancellationToken);

        if (mediaFile == null || mediaFile.HlsStatus != VideoStatus.READY || mediaFile.Status != UploadStatus.COMPLETED) return false;

        var userId = _user.Id;

        // Check ownership
        if (!string.IsNullOrEmpty(userId) && mediaFile.UserId == userId) return true;

        if (mediaFile.CourseId.HasValue)
        {
            var course = await _context.Courses
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == mediaFile.CourseId.Value, cancellationToken);
            
            if (course != null)
            {
                // check if the user is instructor or collaborator
                if (!string.IsNullOrEmpty(userId))
                {
                    bool hasInstructorAccess = await _courseAuth.HasCourseAccessAsync(course.Id, userId, CoursePermission.View, cancellationToken);
                    if (hasInstructorAccess) return true;
                }

                // check if the item is a free preview
                if (!string.IsNullOrEmpty(course.Content))
                {
                    // A quick check via string contains or parsing the JSON
                    if (course.Content.Contains($"\"videoId\":{request.VideoId}") && course.Content.Contains("\"isFreePreview\":true"))
                    {
                        try
                        {
                            var contentObj = System.Text.Json.JsonSerializer.Deserialize<Edunary.Application.CourseProgresses.Commands.UpdateCourseProgressCommand.CourseContentSchema>(course.Content);
                            if (contentObj != null && contentObj.Contents != null)
                            {
                                foreach (var section in contentObj.Contents)
                                {
                                    foreach (var item in section.Items)
                                    {
                                        if (item.VideoId == request.VideoId && item.IsFreePreview)
                                        {
                                            return true;
                                        }
                                    }
                                }
                            }
                        }
                        catch { /* ignore json parse errors */ }
                    }
                }
            }

            if (!string.IsNullOrEmpty(userId))
            {
                var isEnrolled = await _context.Enrollments
                    .AsNoTracking()
                    .AnyAsync(e => e.CourseId == mediaFile.CourseId.Value && e.StudentId == userId, cancellationToken);

                if (isEnrolled) return true;
            }
        }

        return false;
    }
}
