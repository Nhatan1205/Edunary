namespace Edunary.Application.CourseNotes.Commands.UpdateCourseNoteCommand;

public class UpdateCourseNoteCommandValidator : AbstractValidator<UpdateCourseNoteCommand>
{
    public UpdateCourseNoteCommandValidator()
    {
        RuleFor(x => x.NoteId)
            .GreaterThan(0);

        RuleFor(x => x.TimestampSeconds)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.Content)
            .NotEmpty()
            .MaximumLength(2000);
    }
}
