using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.CourseProgresses.Queries.GetCourseProgressQuery;

public class GetCourseProgressQuery : IRequest<CourseProgressDto>
{
    public int CourseId { get; init; }
}
public class GetCourseProgressQueryHandler : IRequestHandler<GetCourseProgressQuery, CourseProgressDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetCourseProgressQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<CourseProgressDto> Handle(GetCourseProgressQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        var courseProgress = await _context.CourseProgress
            .FirstOrDefaultAsync(cp => cp.CourseId == request.CourseId && cp.StudentId == userId, cancellationToken);

        if (courseProgress == null)
        {
            return null;
        }

        var dto = new CourseProgressDto
        {
            Id = courseProgress.Id,
            CourseId = courseProgress.CourseId,
            StudentId = courseProgress.StudentId,
            Progress = courseProgress.Progress
        };

        return dto;
    }
}