using Edunary.Domain.Enums;

namespace Edunary.Domain.Entities;

public class QualityCheckIssue : BaseAuditableEntity
{
    public int ReportId { get; set; }

    public ReviewFeedbackCategory Category { get; set; }

    public QualityIssueSeverity Severity { get; set; }

    public QualityIssueStatus AdminAction { get; set; }

    public string RuleId { get; set; }

    public string Location { get; set; }

    public string Description { get; set; }

    public string Evidence { get; set; }

    public string Suggestion { get; set; }

    // Navigation properties
    public QualityCheckReport Report { get; set; } = null!;
}
