using FluentValidation;

namespace Edunary.Application.InstructorReports.Queries.GetInstructorReport;

public class GetInstructorReportQueryValidator : AbstractValidator<GetInstructorReportQuery>
{
    public GetInstructorReportQueryValidator()
    {
        RuleFor(x => x)
            .Must(x => x.From == null || x.To == null || x.From <= x.To)
            .WithMessage("From must be before or equal to To.");

        RuleFor(x => x)
            .Must(x => x.From == null || x.To == null ||
                       (x.To.Value - x.From.Value).TotalDays <= 365 * 3)
            .WithMessage("Date range must not exceed 3 years.");

        RuleFor(x => x.CourseId)
            .GreaterThan(0)
            .When(x => x.CourseId.HasValue)
            .WithMessage("CourseId must be a positive integer.");
    }
}
