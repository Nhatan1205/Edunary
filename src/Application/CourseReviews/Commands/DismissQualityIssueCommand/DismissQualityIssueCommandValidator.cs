using FluentValidation;

namespace Edunary.Application.CourseReviews.Commands.DismissQualityIssueCommand;

public class DismissQualityIssueCommandValidator : AbstractValidator<DismissQualityIssueCommand>
{
    public DismissQualityIssueCommandValidator()
    {
        RuleFor(v => v.IssueId)
            .GreaterThan(0)
            .WithMessage("IssueId is required.");
    }
}
