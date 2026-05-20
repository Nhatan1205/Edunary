using FluentValidation;

namespace Edunary.Application.RatingCourses.Commands.UpsertRatingResponseCommand;

// Validator for verifying rating response input data
public class UpsertRatingResponseCommandValidator : AbstractValidator<UpsertRatingResponseCommand>
{
    public UpsertRatingResponseCommandValidator()
    {
        RuleFor(v => v.RatingCourseId)
            .GreaterThan(0)
            .WithMessage("Rating course ID must be greater than 0");

        RuleFor(v => v.ResponseText)
            .NotEmpty()
            .WithMessage("Response text is required");
    }
}
