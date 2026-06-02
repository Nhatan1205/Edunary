using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.CourseReviews.Queries.GetQualityReportsQuery;

public class QualityReportSummaryDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public float OverallScore { get; set; }
    public QualityCheckStatus Status { get; set; }
    public int TotalIssues { get; set; }
    public int CriticalCount { get; set; }
    public int WarningCount { get; set; }
    public int SuggestionCount { get; set; }
    public DateTimeOffset Created { get; set; }
    public string CreatedBy { get; set; }
    public bool IsLatest { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<QualityCheckReport, QualityReportSummaryDto>();
        }
    }
}
