using Edunary.Domain.Enums;
using Edunary.Domain.Entities;
using AutoMapper;

namespace Edunary.Application.CourseReviews.Queries.GetInstructorQualityReportDetail;
public class InstructorQualityReportDetailDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public QualityCheckStatus Status { get; set; }
    public string AnalysisSummary { get; set; }
    public int TotalIssues { get; set; }
    public bool IsLatest { get; set; }
    public DateTimeOffset Created { get; set; }
    public string CreatedBy { get; set; }
    public List<InstructorQualityIssueDto> Issues { get; set; } = new();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<QualityCheckReport, InstructorQualityReportDetailDto>()
                .ForMember(d => d.TotalIssues, opt => opt.MapFrom(s => s.Issues.Count))
                .ForMember(d => d.IsLatest, opt => opt.Ignore());
        }
    }
}

public class InstructorQualityIssueDto
{
    public int Id { get; set; }
    public int ReportId { get; set; }
    public QualityIssueSeverity Severity { get; set; }
    public string Location { get; set; }
    public string Description { get; set; }
    public string Suggestion { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<QualityCheckIssue, InstructorQualityIssueDto>();
        }
    }
}
