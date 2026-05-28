using System.Text.Json;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.CourseReviews.Queries.GetQualityReportDetailQuery;

public class QualityReportDetailDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public float OverallScore { get; set; }
    public Dictionary<string, float> CategoryScores { get; set; }
    public QualityCheckStatus Status { get; set; }
    public string AnalysisSummary { get; set; }
    public int TotalIssues { get; set; }
    public int CriticalCount { get; set; }
    public int WarningCount { get; set; }
    public int SuggestionCount { get; set; }
    public bool IsLatest { get; set; }
    public DateTimeOffset Created { get; set; }
    public string CreatedBy { get; set; }
    public List<QualityIssueDto> Issues { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<QualityCheckReport, QualityReportDetailDto>()
                .ForMember(d => d.CategoryScores, opt => opt.MapFrom(s => CalculateScores(s.Issues)))
                .ForMember(d => d.TotalIssues, opt => opt.MapFrom(s => s.Issues.Count))
                .ForMember(d => d.CriticalCount, opt => opt.MapFrom(s => s.Issues.Count(i => i.Severity == QualityIssueSeverity.Critical)))
                .ForMember(d => d.WarningCount, opt => opt.MapFrom(s => s.Issues.Count(i => i.Severity == QualityIssueSeverity.Warning)))
                .ForMember(d => d.SuggestionCount, opt => opt.MapFrom(s => s.Issues.Count(i => i.Severity == QualityIssueSeverity.Suggestion)))
                .ForMember(d => d.IsLatest, opt => opt.Ignore()); // Will be populated in the query handler
        }

        private static Dictionary<string, float> CalculateScores(ICollection<QualityCheckIssue> issues)
        {
            var categories = new[]
            {
                "LearningObjectives", // mapped from IntendedLearners
                "LandingPage",        // mapped from CourseLandingPage, CourseTitleSubtitle, CourseDescription, CourseImage
                "CourseContent",      // mapped from CourseContent, VideoQuality, AudioQuality
                "Policy"              // mapped from Policy
            };

            var scoreDict = new Dictionary<string, float>();

            foreach (var cat in categories)
            {
                List<QualityCheckIssue> catIssues;

                if (cat == "LearningObjectives")
                {
                    catIssues = issues.Where(i => i.Category == ReviewFeedbackCategory.IntendedLearners).ToList();
                }
                else if (cat == "LandingPage")
                {
                    catIssues = issues.Where(i => i.Category == ReviewFeedbackCategory.CourseLandingPage ||
                                                  i.Category == ReviewFeedbackCategory.CourseTitleSubtitle ||
                                                  i.Category == ReviewFeedbackCategory.CourseDescription ||
                                                  i.Category == ReviewFeedbackCategory.CourseImage).ToList();
                }
                else if (cat == "CourseContent")
                {
                    catIssues = issues.Where(i => i.Category == ReviewFeedbackCategory.CourseContent ||
                                                  i.Category == ReviewFeedbackCategory.VideoQuality ||
                                                  i.Category == ReviewFeedbackCategory.AudioQuality).ToList();
                }
                else
                {
                    catIssues = issues.Where(i => i.Category == ReviewFeedbackCategory.Policy).ToList();
                }

                var critical = catIssues.Count(i => i.Severity == QualityIssueSeverity.Critical && i.AdminAction != QualityIssueStatus.Dismissed);
                var warning = catIssues.Count(i => i.Severity == QualityIssueSeverity.Warning && i.AdminAction != QualityIssueStatus.Dismissed);
                var suggestion = catIssues.Count(i => i.Severity == QualityIssueSeverity.Suggestion && i.AdminAction != QualityIssueStatus.Dismissed);

                var catScore = 100f - (critical * 15f + warning * 5f + suggestion * 2f);
                if (catScore < 0)
                {
                    catScore = 0;
                }
                scoreDict[cat] = catScore;
            }

            return scoreDict;
        }
    }
}
