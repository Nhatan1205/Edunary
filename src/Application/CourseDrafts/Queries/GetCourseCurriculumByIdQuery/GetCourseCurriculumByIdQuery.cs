using Edunary.Application.Common.Interfaces;
using Edunary.Application.CourseProgresses.Commands.UpdateCourseProgressCommand;
using Edunary.Application.Courses.Queries.GetCourseById;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Edunary.Application.CourseDrafts.Queries.GetCourseCurriculumByIdQuery;

public class GetCourseCurriculumByIdQuery : IRequest<GetCourseByIdDto>
{
    public int Id { get; init; }
}
public class GetCourseCurriculumByIdQueryHandler : IRequestHandler<GetCourseCurriculumByIdQuery, GetCourseByIdDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;
    public GetCourseCurriculumByIdQueryHandler(
        IApplicationDbContext context,
        IMapper mapper, 
        ICurrentUserService currentUserService
    )
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }
    public async Task<GetCourseByIdDto> Handle(GetCourseCurriculumByIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;
        var course = await _context.Courses
                            .Where(c => c.Id == request.Id && c.CreatedBy == userId)
                            .FirstOrDefaultAsync(cancellationToken);
        if (course != null && !string.IsNullOrEmpty(course.Content))
        {
            var options = new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true,
                    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull 
                };
            var curriculumStructure = JsonSerializer.Deserialize<CourseContentSchema>(course.Content, options);
            if (curriculumStructure?.Contents != null)
            {
                var videoIds = curriculumStructure.Contents
                    .SelectMany(s => s.Items)
                    .Where(i => i.VideoId > 0 && string.IsNullOrEmpty(i.ThumbnailUrl))
                    .Select(i => i.VideoId)
                    .Distinct()
                    .ToList();

                if (videoIds.Any())
                {
                    var mediaFiles = await _context.MediaFiles
                        .Where(m => videoIds.Contains(m.Id) && !string.IsNullOrEmpty(m.ThumbnailUrl))
                        .Select(m => new { m.Id, m.ThumbnailUrl })
                        .ToDictionaryAsync(m => m.Id, m => m.ThumbnailUrl, cancellationToken);

                    foreach (var section in curriculumStructure.Contents)
                    {
                        foreach (var item in section.Items)
                        {
                            if (item.VideoId > 0 && string.IsNullOrEmpty(item.ThumbnailUrl) && mediaFiles.TryGetValue(item.VideoId, out var thumbnailUrl))
                            {
                                item.ThumbnailUrl = thumbnailUrl;
                            }
                        }
                    }
                    course.Content = JsonSerializer.Serialize(curriculumStructure, options);
                    await _context.SaveChangesAsync(cancellationToken);
                }
            }
        }
        
        return _mapper.Map<GetCourseByIdDto>(course);
    }
}