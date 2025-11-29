using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;
using Edunary.Domain.Events.Announcements;

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

    public UpdateAnnouncementCommandHandler(IApplicationDbContext context,ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(
        UpdateAnnouncementCommand request, CancellationToken cancellationToken)
    {
        var announcement = await _context.Announcements
            .Include(x => x.Courses)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
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

        if (request.Status == AnnouncementStatus.Sent)
        {
            announcement.SentAt = DateTime.UtcNow;
            announcement.AddDomainEvent(new AnnouncementSentEvent(announcement));
        }


        // Update fields
        announcement.Subject = request.Subject;
        announcement.Content = request.Content;
        announcement.Status = request.Status;

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

