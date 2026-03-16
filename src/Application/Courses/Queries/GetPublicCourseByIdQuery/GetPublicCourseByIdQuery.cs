using System.Text.Json;
using System.Text.Json.Serialization;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Courses.Queries.GetPublicCourseByIdQuery;

namespace Edunary.Application.Courses.Queries.GetPublicCourseById;

public class GetPublicCourseByIdQuery : IRequest<GetPublicCourseByIdDto>
{
    public int Id { get; init; }
}

public class GetPublicCourseByIdQueryHandler : IRequestHandler<GetPublicCourseByIdQuery, GetPublicCourseByIdDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IIdentityService _identityService;

    public GetPublicCourseByIdQueryHandler(IApplicationDbContext context, IMapper mapper, IIdentityService identityService)
    {
        _context = context;
        _mapper = mapper;
        _identityService = identityService;
    }

    public async Task<GetPublicCourseByIdDto> Handle(GetPublicCourseByIdQuery request, CancellationToken cancellationToken)
    {
        var course = await _context.Courses
            .Include(c => c.Category)
            .Where(c => c.Id == request.Id)
            .ProjectTo<GetPublicCourseByIdDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);
        if (course == null) return null!;
        var user = await _identityService.GetUserById(course.CreatedBy);

        if (user != null)
        {
            course.Instructor = new InstructorDto
            {
                Id = user.Id,
                Name = user.FullName,
                Avatar = user.Avatar
            };
        }

        if (!string.IsNullOrWhiteSpace(course.Content))
        {
            //deserialize content JSON
            var contentObj = JsonSerializer.Deserialize<CourseContentDto>(course.Content);
            var summary = new CourseContentSummaryDto
            {
                TotalVideoDuration = contentObj.TotalVideoDuration,
                TotalSection = contentObj.Contents.Count,
                TotalLecturer = contentObj.Contents.Sum(s => s.Items.Count),
                Sections = contentObj.Contents.Select(section => new SectionSummaryDto
                {
                    Title = section.Title,
                    Items = section.Items.Select(item => new ItemSummaryDto
                    {
                        Title = item.Title,
                        ContentType = item.ContentType,
                        VideoDuration = item.VideoDuration ?? "0 seconds"
                    }).ToList()
                }).ToList()
            };
            //serialize content JSON
            course.Content = JsonSerializer.Serialize(summary, new JsonSerializerOptions
            {
                WriteIndented = true
            });
        }
        return course;
    }
}
