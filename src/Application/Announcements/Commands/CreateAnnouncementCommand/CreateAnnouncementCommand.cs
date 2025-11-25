using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.Announcements.Commands.CreateDraftAnnouncementCommand;
public class CreateAnnouncementCommand : IRequest<ReturnResult<CreateAnnouncementCommandDto>>
{
    public string Subject { get; set; }
    public string Content { get; set; }
    public List<int> CourseIds { get; set; } = new();
    public AnnouncementStatus Status { get; set; }
}

public class CreateAnnouncementCommandHandler : IRequestHandler<CreateAnnouncementCommand, ReturnResult<CreateAnnouncementCommandDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public CreateAnnouncementCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService, IMapper mapper)
    {
        _context = context;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }
    public async Task<ReturnResult<CreateAnnouncementCommandDto>> Handle(CreateAnnouncementCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var announcement = new Announcement
            {
                Subject = request.Subject,
                Content = request.Content,
                Status = request.Status
            };
            if (request.Status == AnnouncementStatus.Sent)
            {
                announcement.SentAt = DateTime.UtcNow;
            }
            if (request.CourseIds.Any())
            {
                var courses = await _context.Courses
                    .Where(c => request.CourseIds.Contains(c.Id))
                    .ToListAsync(cancellationToken);

                // Add selected classes
                foreach (var course in courses)
                {
                    announcement.Courses.Add(course);
                }
            }
            _context.Announcements.Add(announcement);
            await _context.SaveChangesAsync(cancellationToken);
            if(request.Status == AnnouncementStatus.Sent)
            {
                // TODO: implement send email to students in the selected courses
            }
            var result = _mapper.Map<CreateAnnouncementCommandDto>(announcement);
            return new ReturnResult<CreateAnnouncementCommandDto>
            {
                Result = result,
                Message = "Draft announcement created successfully."
            };
        }
        catch (Exception ex)
        {
            return new ReturnResult<CreateAnnouncementCommandDto>
            {
                Result = null,
                Message = $"Error: {ex.Message}"
            };
        }
    }
}
