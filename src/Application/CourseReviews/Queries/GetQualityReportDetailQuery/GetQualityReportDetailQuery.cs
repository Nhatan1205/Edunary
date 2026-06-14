using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Edunary.Application.Common.Behaviours;

namespace Edunary.Application.CourseReviews.Queries.GetQualityReportDetailQuery;

[ActivityLog(ActivityType.ViewQualityReport, "View Quality Report")]
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
            .Where(r => r.RequestedByRole == "Admin")
            .ProjectTo<QualityReportDetailDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(r => r.Id == request.ReportId, cancellationToken);

        Guard.Against.NotFound(request.ReportId, report);

        // Check if this is the latest report for the course
        var isLatest = !await _context.QualityCheckReports
            .AnyAsync(r => r.CourseId == report.CourseId && r.RequestedByRole == "Admin" && r.Created > report.Created, cancellationToken);

        report.IsLatest = isLatest;

        return report;
    }
}
