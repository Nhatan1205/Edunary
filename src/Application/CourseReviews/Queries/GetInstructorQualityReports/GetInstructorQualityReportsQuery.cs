using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using MediatR;
using AutoMapper;
using AutoMapper.QueryableExtensions;

namespace Edunary.Application.CourseReviews.Queries.GetInstructorQualityReports;

public record GetInstructorQualityReportsQuery : IRequest<List<InstructorQualityReportSummaryDto>>
{
    public int CourseId { get; init; }
}

public class GetInstructorQualityReportsQueryHandler : IRequestHandler<GetInstructorQualityReportsQuery, List<InstructorQualityReportSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;
    private readonly IMapper _mapper;

    public GetInstructorQualityReportsQueryHandler(
        IApplicationDbContext context, 
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth,
        IMapper mapper)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
        _mapper = mapper;
    }

    public async Task<List<InstructorQualityReportSummaryDto>> Handle(GetInstructorQualityReportsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        // 1. Authorize ownership
        var hasAccess = await _courseAuth.HasCourseAccessAsync(
            request.CourseId, userId, CoursePermission.Manage, cancellationToken);

        if (!hasAccess)
        {
            throw new UnauthorizedAccessException("You do not have permission to view quality reports for this course.");
        }

        // 2. Fetch reports
        var reports = await _context.QualityCheckReports
            .Where(r => r.CourseId == request.CourseId && r.RequestedByRole == "Instructor")
            .OrderByDescending(r => r.Created)
            .ProjectTo<InstructorQualityReportSummaryDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        if (reports.Count > 0)
        {
            reports[0].IsLatest = true;
            
            // Calculate cooldown next run available time (7 days)
            var lastRunTime = reports[0].Created;
            var nextAvailable = lastRunTime.AddDays(7);
            foreach (var r in reports)
            {
                r.NextRunAvailableAt = nextAvailable;
            }
        }

        return reports;
    }
}
