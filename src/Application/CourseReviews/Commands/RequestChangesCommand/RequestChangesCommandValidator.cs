using FluentValidation;

namespace Edunary.Application.CourseReviews.Commands.RequestChangesCommand;

public class RequestChangesCommandValidator : AbstractValidator<RequestChangesCommand>
{
    public RequestChangesCommandValidator()
    {
        RuleFor(x => x.SubmissionId)
            .GreaterThan(0)
            .WithMessage("SubmissionId must be valid.");
    }
}
