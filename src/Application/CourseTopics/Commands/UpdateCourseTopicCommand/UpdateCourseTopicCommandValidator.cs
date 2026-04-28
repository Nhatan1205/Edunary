namespace Edunary.Application.CourseTopics.Commands.UpdateCourseTopic;

public class UpdateCourseTopicCommandValidator : AbstractValidator<UpdateCourseTopicCommand>
{
    public UpdateCourseTopicCommandValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("Id must be greater than 0.");
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Topic name is required.")
            .MinimumLength(2).WithMessage("Topic name must be at least 2 characters.")
            .MaximumLength(100).WithMessage("Topic name must not exceed 100 characters.");
    }
}
