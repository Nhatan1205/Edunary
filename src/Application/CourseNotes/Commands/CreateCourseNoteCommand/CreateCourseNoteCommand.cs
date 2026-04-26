using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseNotes.Commands.CreateCourseNoteCommand;

public record CreateCourseNoteCommand : IRequest<Result>
{
    public int CourseId { get; init; }
    public int VideoId { get; init; }
    #nullable enable
    public string? ItemId { get; init; }
    public double TimestampSeconds { get; init; }
    public string Content { get; init; } = string.Empty;
}

public class CreateCourseNoteCommandHandler : IRequestHandler<CreateCourseNoteCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreateCourseNoteCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(CreateCourseNoteCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        var hasEnrollment = await _context.Enrollments
            .AnyAsync(e => e.CourseId == request.CourseId && e.StudentId == userId, cancellationToken);

        if (!hasEnrollment)
            return Result.Failure("You must be enrolled in this course to create notes");

        var note = new CourseNote
        {
            CourseId = request.CourseId,
            StudentId = userId,
            VideoId = request.VideoId,
            ItemId = request.ItemId,
            TimestampSeconds = request.TimestampSeconds,
            Content = request.Content
        };

        _context.CourseNotes.Add(note);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(note.Id, "Note created successfully");
    }
}
