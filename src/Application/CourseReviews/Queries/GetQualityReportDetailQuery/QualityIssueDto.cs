using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.CourseReviews.Queries.GetQualityReportDetailQuery;

public class QualityIssueDto
{
    public int Id { get; set; }
    public int ReportId { get; set; }
    public ReviewFeedbackCategory Category { get; set; }
    public QualityIssueSeverity Severity { get; set; }
    public QualityIssueStatus AdminAction { get; set; }
    public string RuleId { get; set; }
    public string Location { get; set; }
    public string Description { get; set; }
    public string Evidence { get; set; }
    public string Suggestion { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<QualityCheckIssue, QualityIssueDto>();
        }
    }
}
