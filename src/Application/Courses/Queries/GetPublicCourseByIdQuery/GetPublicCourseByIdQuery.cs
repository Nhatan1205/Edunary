using System.Text.Json;
using System.Text.Json.Serialization;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Courses.Queries.GetPublicCourseByIdQuery;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

using Edunary.Application.Common.Behaviours;

namespace Edunary.Application.Courses.Queries.GetPublicCourseById;

[ActivityLog(ActivityType.ViewCourseOverview, "View Course Overview")]
public class GetPublicCourseByIdQuery : IRequest<GetPublicCourseByIdDto>, ICacheableQuery
{
    public int Id { get; init; }
    public string UserId { get; init; }

    public string CacheKey => string.IsNullOrEmpty(UserId)
        ? $"courses:public:{Id}:guest"
        : $"courses:public:{Id}:user:{UserId}";

    public TimeSpan CacheDuration => TimeSpan.FromMinutes(15);
}

public class GetPublicCourseByIdQueryHandler : IRequestHandler<GetPublicCourseByIdQuery, GetPublicCourseByIdDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IIdentityService _identityService;
    private readonly ICurrentUserService _currentUserService;

    public GetPublicCourseByIdQueryHandler(IApplicationDbContext context, IMapper mapper, IIdentityService identityService, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _identityService = identityService;
        _currentUserService = currentUserService;
    }

    public async Task<GetPublicCourseByIdDto> Handle(GetPublicCourseByIdQuery request, CancellationToken cancellationToken)
    {
        var course = await _context.Courses
            .Include(c => c.Category)
            .Include(c => c.Topics)
            .Where(c => c.Id == request.Id && c.Status == CourseStatus.Public)
            .ProjectTo<GetPublicCourseByIdDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);
        if (course == null) return null!;
        var user = await _identityService.GetUserById(course.CreatedBy);

        var instructors = new List<InstructorDto>();

        if (user != null)
        {
            instructors.Add(new InstructorDto
            {
                Id = user.Id,
                Name = user.FullName,
                Avatar = user.Avatar
            });
        }

        var visibleCollabUserIds = await _context.CourseCollaborators
            .Where(c => c.CourseId == request.Id && c.IsVisible && c.InviteStatus == CollaboratorInviteStatus.Accepted)
            .Select(c => c.UserId)
            .ToListAsync(cancellationToken);

        if (visibleCollabUserIds.Any())
        {
            var collabUsers = await _identityService.GetUserIdentitiesByIdsAsync(visibleCollabUserIds, cancellationToken);
            instructors.AddRange(collabUsers.Select(u => new InstructorDto
            {
                Id = u.Id,
                Name = u.FullName,
                Avatar = u.Avatar
            }));
        }

        course.Instructors = instructors;

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
                        VideoDuration = item.VideoDuration ?? "0 seconds",
                        IsFreePreview = item.IsFreePreview,
                        VideoId = item.IsFreePreview ? item.VideoId : 0
                    }).ToList()
                }).ToList()
            };
            //serialize content JSON
            course.Content = JsonSerializer.Serialize(summary, new JsonSerializerOptions
            {
                WriteIndented = true
            });
        }
        // set enrollment flag if user is authenticated
        var userId = _currentUserService?.UserId;
        if (!string.IsNullOrEmpty(userId))
        {
            var isEnrolled = await _context.Enrollments
                .AnyAsync(e => e.StudentId == userId && e.CourseId == course.Id, cancellationToken);

            course.IsEnrolled = isEnrolled;
        }
        return course;
    }
}
