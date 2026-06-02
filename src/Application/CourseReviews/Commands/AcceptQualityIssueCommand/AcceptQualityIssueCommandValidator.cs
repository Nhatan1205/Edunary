using FluentValidation;

namespace Edunary.Application.CourseReviews.Commands.AcceptQualityIssueCommand;

public class AcceptQualityIssueCommandValidator : AbstractValidator<AcceptQualityIssueCommand>
{
    public AcceptQualityIssueCommandValidator()
    {
        RuleFor(v => v.IssueId)
            .GreaterThan(0)
            .WithMessage("IssueId is required.");
    }
}
