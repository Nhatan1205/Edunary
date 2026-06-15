using FluentValidation;
using Edunary.Application.CourseAssistant.Commands.SendCourseAssistantMessageCommand;

namespace Edunary.Application.CourseAssistant.Commands.SendCourseAssistantMessageCommand;

public class SendCourseAssistantMessageCommandValidator
    : AbstractValidator<SendCourseAssistantMessageCommand>
{
    public SendCourseAssistantMessageCommandValidator()
    {
        RuleFor(x => x.CourseId)
            .GreaterThan(0)
            .WithMessage("CourseId must be a positive integer.");

        RuleFor(x => x.Message)
            .NotEmpty()
            .WithMessage("Message cannot be empty.")
            .MaximumLength(2000)
            .WithMessage("Message cannot exceed 2000 characters.");

        RuleFor(x => x.ContentType)
            .Must(t => string.IsNullOrEmpty(t) || new[] { "lecture", "quiz", "assignment" }.Contains(t))
            .WithMessage("ContentType must be one of: lecture, quiz, assignment.");
    }
}
