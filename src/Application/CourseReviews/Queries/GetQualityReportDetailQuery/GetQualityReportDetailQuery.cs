using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseReviews.Queries.GetQualityReportDetailQuery;

public record GetQualityReportDetailQuery : IRequest<QualityReportDetailDto>
{
    public int ReportId { get; init; }
}

public class GetQualityReportDetailQueryHandler : IRequestHandler<GetQualityReportDetailQuery, QualityReportDetailDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetQualityReportDetailQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<QualityReportDetailDto> Handle(GetQualityReportDetailQuery request, CancellationToken cancellationToken)
    {
        var report = await _context.QualityCheckReports
            .Include(r => r.Issues)
            .ProjectTo<QualityReportDetailDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(r => r.Id == request.ReportId, cancellationToken);

        Guard.Against.NotFound(request.ReportId, report);

        // Check if this is the latest report for the course
        var isLatest = !await _context.QualityCheckReports
            .AnyAsync(r => r.CourseId == report.CourseId && r.Created > report.Created, cancellationToken);

        report.IsLatest = isLatest;

        // Recalculate OverallScore dynamically (ignoring dismissed issues)
        var activeIssues = report.Issues.Where(i => i.AdminAction != QualityIssueStatus.Dismissed).ToList();
        var critical = activeIssues.Count(i => i.Severity == QualityIssueSeverity.Critical);
        var warning = activeIssues.Count(i => i.Severity == QualityIssueSeverity.Warning);
        var suggestion = activeIssues.Count(i => i.Severity == QualityIssueSeverity.Suggestion);

        var dynamicScore = 100f - (critical * 15f + warning * 5f + suggestion * 2f);
        report.OverallScore = dynamicScore < 0 ? 0 : dynamicScore;

        return report;
    }
}
