using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseReviews.Queries.GetQualityReportsQuery;

public record GetQualityReportsQuery : IRequest<List<QualityReportSummaryDto>>
{
    public int CourseId { get; init; }
}

public class GetQualityReportsQueryHandler : IRequestHandler<GetQualityReportsQuery, List<QualityReportSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetQualityReportsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<QualityReportSummaryDto>> Handle(GetQualityReportsQuery request, CancellationToken cancellationToken)
    {
        var reports = await _context.QualityCheckReports
            .Where(r => r.CourseId == request.CourseId)
            .OrderByDescending(r => r.Created)
            .Select(r => new QualityReportSummaryDto
            {
                Id = r.Id,
                CourseId = r.CourseId,
                OverallScore = r.OverallScore,
                Status = r.Status,
                Created = r.Created,
                CreatedBy = r.CreatedBy,
                TotalIssues = r.Issues.Count,
                CriticalCount = r.Issues.Count(i => i.Severity == QualityIssueSeverity.Critical),
                WarningCount = r.Issues.Count(i => i.Severity == QualityIssueSeverity.Warning),
                SuggestionCount = r.Issues.Count(i => i.Severity == QualityIssueSeverity.Suggestion)
            })
            .ToListAsync(cancellationToken);

        // Mark the first one as latest (since they are ordered descending by Created date)
        if (reports.Count > 0)
        {
            reports[0].IsLatest = true;
        }

        return reports;
    }
}
