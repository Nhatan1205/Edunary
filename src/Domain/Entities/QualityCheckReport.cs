using Edunary.Domain.Enums;

namespace Edunary.Domain.Entities;

public class QualityCheckReport : BaseAuditableEntity
{
    public int CourseId { get; set; }

    public float OverallScore { get; set; }

    public QualityCheckStatus Status { get; set; }

    public string AnalysisSummary { get; set; }

    // Navigation properties
    public Course Course { get; set; } = null!;

    public ICollection<QualityCheckIssue> Issues { get; set; } = new List<QualityCheckIssue>();
}
