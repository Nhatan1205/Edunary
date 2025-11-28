using System.Text.Json;
using System.Text.Json.Serialization;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.CourseProgresses.Commands.UpdateCourseProgressCommand;


namespace Edunary.Application.CourseProgresses.Queries.GetLearningHeaderQuery;

public class GetLearningHeaderQuery : IRequest<LearningHeaderDto>
{
    public int CourseId { get; init; }
}

public class GetLearningHeaderQueryHandler : IRequestHandler<GetLearningHeaderQuery, LearningHeaderDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetLearningHeaderQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<LearningHeaderDto> Handle(GetLearningHeaderQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        var courseProgress = await _context.CourseProgress
            .FirstOrDefaultAsync(cp => cp.CourseId == request.CourseId && cp.StudentId == userId, cancellationToken);
        
        var options = new JsonSerializerOptions 
        { 
            PropertyNameCaseInsensitive = true,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull 
        };
        var content = courseProgress != null
            ? JsonSerializer.Deserialize<CourseContentSchema>(courseProgress.Progress, options)
            : null;
        if (content == null || content.Contents == null)
        {
            return new LearningHeaderDto
            {
                Title = "Course Title",
                TotalLectures = 0,
                CompletedLectures = 0
            };
        }
        int totalLectures = 0;
        int completedLectures = 0;
        foreach (var section in content.Contents)
        {
            foreach (var item in section.Items)
            {
                if (item.Type == "lecture")
                {
                    totalLectures++;
                    if (item.IsCompleted)
                    {
                        completedLectures++;
                    }
                }
            }
        }
        return new LearningHeaderDto
        {
            Title = content.Title,
            TotalLectures = totalLectures,
            CompletedLectures = completedLectures
        };
    }
}
