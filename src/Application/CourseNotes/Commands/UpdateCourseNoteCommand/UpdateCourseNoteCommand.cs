using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseNotes.Commands.UpdateCourseNoteCommand;

public record UpdateCourseNoteCommand : IRequest<Result>
{
    public int NoteId { get; init; }
    public double TimestampSeconds { get; init; }
    public string Content { get; init; } = string.Empty;
}

public class UpdateCourseNoteCommandHandler : IRequestHandler<UpdateCourseNoteCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateCourseNoteCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(UpdateCourseNoteCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        var note = await _context.CourseNotes
            .FirstOrDefaultAsync(n => n.Id == request.NoteId, cancellationToken);

        if (note == null)
            return Result.Failure("Note not found");

        if (note.StudentId != userId)
            return Result.Failure("You can only edit your own notes");

        note.TimestampSeconds = request.TimestampSeconds;
        note.Content = request.Content;

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success("Note updated successfully");
    }
}
