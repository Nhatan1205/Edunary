using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseNotes.Commands.DeleteCourseNoteCommand;

public record DeleteCourseNoteCommand : IRequest<Result>
{
    public int NoteId { get; init; }
}

public class DeleteCourseNoteCommandHandler : IRequestHandler<DeleteCourseNoteCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public DeleteCourseNoteCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(DeleteCourseNoteCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        var note = await _context.CourseNotes
            .FirstOrDefaultAsync(n => n.Id == request.NoteId, cancellationToken);

        if (note == null)
            return Result.Failure("Note not found");

        if (note.StudentId != userId)
            return Result.Failure("You can only delete your own notes");

        _context.CourseNotes.Remove(note);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success("Note deleted successfully");
    }
}
