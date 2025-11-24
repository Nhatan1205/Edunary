namespace Edunary.Application.RatingCourses.Commands.UpsertRatingCourseCommand;

public class UpsertRatingCourseCommandValidator : AbstractValidator<UpsertRatingCourseCommand>
{
    public UpsertRatingCourseCommandValidator()
    {
        RuleFor(v => v.CourseId)
            .GreaterThan(0)
            .WithMessage("CourseId must be greater than 0");

        RuleFor(v => v.UserId)
            .NotEmpty()
            .WithMessage("UserId is required");

        RuleFor(v => v.Rating)
            .InclusiveBetween(1, 5)
            .WithMessage("Rating must be between 1 and 5");

        RuleFor(v => v.Review)
            .MaximumLength(500)
            .WithMessage("Review must not exceed 500 characters");
    }
}
