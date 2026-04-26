using Edunary.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseNotes.Queries.GetCourseNotesByVideo;

public class CourseNoteDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public int VideoId { get; set; }
    #nullable enable
    public string? ItemId { get; set; }
    public double TimestampSeconds { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTimeOffset Created { get; set; }
    public DateTimeOffset LastModified { get; set; }
}

public record GetCourseNotesByVideoQuery : IRequest<List<CourseNoteDto>>
{
    public int CourseId { get; init; }
    public int VideoId { get; init; }
}

public class GetCourseNotesByVideoQueryHandler : IRequestHandler<GetCourseNotesByVideoQuery, List<CourseNoteDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetCourseNotesByVideoQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<CourseNoteDto>> Handle(GetCourseNotesByVideoQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        return await _context.CourseNotes
            .Where(n => n.CourseId == request.CourseId
                     && n.VideoId == request.VideoId
                     && n.StudentId == userId)
            .OrderBy(n => n.TimestampSeconds)
            .Select(n => new CourseNoteDto
            {
                Id = n.Id,
                CourseId = n.CourseId,
                VideoId = n.VideoId,
                ItemId = n.ItemId,
                TimestampSeconds = n.TimestampSeconds,
                Content = n.Content,
                Created = n.Created,
                LastModified = n.LastModified
            })
            .ToListAsync(cancellationToken);
    }
}
