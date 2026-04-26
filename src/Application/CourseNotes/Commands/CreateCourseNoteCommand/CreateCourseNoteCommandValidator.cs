namespace Edunary.Application.CourseNotes.Commands.CreateCourseNoteCommand;

public class CreateCourseNoteCommandValidator : AbstractValidator<CreateCourseNoteCommand>
{
    public CreateCourseNoteCommandValidator()
    {
        RuleFor(x => x.CourseId)
            .GreaterThan(0);

        RuleFor(x => x.VideoId)
            .GreaterThan(0);

        RuleFor(x => x.TimestampSeconds)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.Content)
            .NotEmpty()
            .MaximumLength(2000);
    }
}
