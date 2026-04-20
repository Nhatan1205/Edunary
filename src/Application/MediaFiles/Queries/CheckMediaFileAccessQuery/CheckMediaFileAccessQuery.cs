using Edunary.Application.Common.Interfaces;
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

    public CheckMediaFileAccessQueryHandler(IApplicationDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task<bool> Handle(CheckMediaFileAccessQuery request, CancellationToken cancellationToken)
    {
        var userId = _user.Id;
        if (string.IsNullOrEmpty(userId)) return false;

        var mediaFile = await _context.MediaFiles
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == request.VideoId, cancellationToken);

        if (mediaFile == null) return false;

        if (mediaFile.UserId == userId) return true;

        if (mediaFile.CourseId.HasValue)
        {
            var course = await _context.Courses
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == mediaFile.CourseId.Value, cancellationToken);
            
            if (course != null && course.CreatedBy == userId) return true;

            var isEnrolled = await _context.Enrollments
                .AsNoTracking()
                .AnyAsync(e => e.CourseId == mediaFile.CourseId.Value && e.StudentId == userId, cancellationToken);

            if (isEnrolled) return true;
        }

        return false;
    }
}
