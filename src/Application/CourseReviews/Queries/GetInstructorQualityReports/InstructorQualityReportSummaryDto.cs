using Edunary.Domain.Enums;
using Edunary.Domain.Entities;
using AutoMapper;

namespace Edunary.Application.CourseReviews.Queries.GetInstructorQualityReports;
public class InstructorQualityReportSummaryDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public QualityCheckStatus Status { get; set; }
    public int TotalIssues { get; set; }
    public DateTimeOffset Created { get; set; }
    public string CreatedBy { get; set; }
    public float OverallScore { get; set; }
    public bool IsLatest { get; set; }
    public DateTimeOffset? NextRunAvailableAt { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<QualityCheckReport, InstructorQualityReportSummaryDto>()
                .ForMember(d => d.TotalIssues, opt => opt.MapFrom(s => s.Issues.Count))
                .ForMember(d => d.IsLatest, opt => opt.Ignore())
                .ForMember(d => d.NextRunAvailableAt, opt => opt.Ignore());
        }
    }
}
