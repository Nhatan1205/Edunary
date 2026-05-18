using System.Text.Json;
using System.Text.Json.Serialization;
using Edunary.Application.Common.Interfaces;
// using Edunary.Application.CourseContents.Queries.GetCourseContentByUserIdQuery;
using Edunary.Application.CourseProgresses.Commands.UpdateCourseProgressCommand;
using Edunary.Application.CourseProgresses.Queries.GetCourseProgressQuery;

namespace Edunary.Application.CourseProgresses.Queries.GetLearningSidebarQuery;

public class GetLearningSidebarQuery : IRequest<CourseProgressDto>
{
    public int CourseId { get; init; }
}
public class GetLearningSidebarQueryHandler : IRequestHandler<GetLearningSidebarQuery, CourseProgressDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public GetLearningSidebarQueryHandler(
        IApplicationDbContext context, 
        IMapper mapper,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<CourseProgressDto> Handle(GetLearningSidebarQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        var courseProgress = await _context.CourseProgress
            .ProjectTo<CourseProgressDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cp => cp.CourseId == request.CourseId && cp.StudentId == userId, cancellationToken);

        if (courseProgress == null)
        {
            return null;
        }
        if (!string.IsNullOrWhiteSpace(courseProgress.Progress))
        {
            // Deserialize progress JSON
            var progressObj = JsonSerializer.Deserialize<CourseContentSchema>(courseProgress.Progress);

            // Fetch published assignment IDs for this course (to filter sidebar items)
            var publishedAssignmentIds = await _context.Assignments
                .Where(a => a.CourseId == request.CourseId && a.IsPublished)
                .Select(a => a.Id)
                .ToHashSetAsync(cancellationToken);

            var simplified = new
            {
                progressObj.Id,
                progressObj.Title,
                Contents = progressObj.Contents.Select(section => new {
                    section.SectionId,
                    section.Title,
                    Items = section.Items
                        .Where(i => i.Type != "assignment" || i.AssignmentId == 0 || publishedAssignmentIds.Contains(i.AssignmentId)) //filter published assignments
                        .Select(i => new {
                            i.ItemId,
                            i.Title,
                            i.Type,
                            i.ContentType,
                            i.IsCompleted,
                            i.VideoDuration,
                            Resources = i.Resources.Select(r => new {
                                r.Id,
                                r.FileName,
                                r.FileUrl
                            }).ToList()
                        }).ToList()
                }).ToList()
            };
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            courseProgress.Progress = JsonSerializer.Serialize(simplified, options);
        }
        return courseProgress;
    }
}
