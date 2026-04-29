namespace Edunary.Application.CourseTopics.Commands.CreateCourseTopic;

public class CreateCourseTopicCommandValidator : AbstractValidator<CreateCourseTopicCommand>
{
    public CreateCourseTopicCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Topic name is required.")
            .MinimumLength(2).WithMessage("Topic name must be at least 2 characters.")
            .MaximumLength(100).WithMessage("Topic name must not exceed 100 characters.");
    }
}
