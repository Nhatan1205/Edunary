using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;

namespace Edunary.Application.Announcements.Commands.UpdateAnnouncementCommand;
public class UpdateAnnouncementCommand : IRequest<Result>
{
    public int Id { get; set; }
    public string Subject { get; set; }
    public string Content { get; set; }
    public List<int> CourseIds { get; set; } = new();
    public AnnouncementStatus Status { get; set; }
}

public class UpdateAnnouncementCommandHandler : IRequestHandler<UpdateAnnouncementCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public UpdateAnnouncementCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IMapper mapper)
    {
        _context = context;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<Result> Handle(
        UpdateAnnouncementCommand request, CancellationToken cancellationToken)
    {
        var announcement = await _context.Announcements
            .Include(x => x.Courses)
            .FirstOrDefaultAsync(x => x.Id == request.Id,cancellationToken);
        Guard.Against.NotFound(request.Id, announcement);
        var userId = _currentUserService?.UserId;
        if (announcement.CreatedBy != userId)
        {
            return Result.Failure("You are not authorized to update this course.");
        }

        if (announcement == null)
        {
            return Result.Failure("Announcement not found.");
        }

        // ❗ Chỉ cho phép update khi đang draft
        if (announcement.Status == AnnouncementStatus.Sent)
        {
            return Result.Failure("Cannot update an announcement that has already been sent.");
        }


        // Update fields
        announcement.Subject = request.Subject;
        announcement.Content = request.Content;
        announcement.Status = request.Status;
        announcement.SentAt = DateTime.UtcNow;

        // Update course list
        announcement.Courses.Clear();

        var courses = await _context.Courses
        .Where(c => request.CourseIds.Contains(c.Id))
        .ToListAsync(cancellationToken);

        foreach (var course in courses)
        {
            announcement.Courses.Add(course);
        }

        await _context.SaveChangesAsync(cancellationToken);

        // TODO: If Status == Sent → send notifications here

        return Result.Success("Announcement updated successfully.");
    }
}

