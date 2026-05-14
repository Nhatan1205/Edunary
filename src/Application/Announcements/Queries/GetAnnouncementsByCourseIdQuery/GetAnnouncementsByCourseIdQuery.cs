using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Mappings;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;

namespace Edunary.Application.Announcements.Queries.GetAnnouncementsByCourseIdQuery;

public class GetAnnouncementsByCourseIdQuery : IRequest<PaginatedList<GetAnnouncementByCourseIdDto>>
{
    public int CourseId { get; set; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class GetAnnouncementsByCourseIdQueryHandler : IRequestHandler<GetAnnouncementsByCourseIdQuery, PaginatedList<GetAnnouncementByCourseIdDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IIdentityService _identityService;

    public GetAnnouncementsByCourseIdQueryHandler(IApplicationDbContext context, IMapper mapper, IIdentityService identityService)
    {
        _context = context;
        _mapper = mapper;
        _identityService = identityService;
    }

    public async Task<PaginatedList<GetAnnouncementByCourseIdDto>> Handle(GetAnnouncementsByCourseIdQuery request, CancellationToken cancellationToken)
    {
        var paginated = await _context.Announcements
            .Where(a => a.Status == AnnouncementStatus.Sent && a.Courses.Any(c => c.Id == request.CourseId))
            .OrderByDescending(a => a.SentAt)
            .ProjectTo<GetAnnouncementByCourseIdDto>(_mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);

        // fetch instructor infos 
        var instructorId = paginated.Items.FirstOrDefault()?.InstructorId;
        if (!string.IsNullOrEmpty(instructorId))
        {
            var instructor = await _identityService.GetUserIdentityByIdAsync(instructorId);
            if (instructor != null)
            {
                foreach (var item in paginated.Items)
                {
                    item.InstructorName = instructor.FullName ?? "Instructor";
                    item.InstructorAvatar = instructor.Avatar ?? string.Empty;
                }
            }
        }

        return paginated;
    }
}
