using Edunary.Application.Common.Behaviours;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Edunary.Domain.Events.Announcements;

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
    private readonly IMapper _mapper;

    public CreateAnnouncementCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
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
                announcement.AddDomainEvent(new AnnouncementSentEvent(announcement));
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
            var result = _mapper.Map<CreateAnnouncementCommandDto>(announcement);
            return new ReturnResult<CreateAnnouncementCommandDto>
            {
                Result = result,
                Message = "announcement created successfully."
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
