using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using MediatR;
using AutoMapper;
using AutoMapper.QueryableExtensions;

namespace Edunary.Application.CourseReviews.Queries.GetInstructorQualityReportDetail;

public record GetInstructorQualityReportDetailQuery : IRequest<InstructorQualityReportDetailDto>
{
    public int ReportId { get; init; }
}

public class GetInstructorQualityReportDetailQueryHandler : IRequestHandler<GetInstructorQualityReportDetailQuery, InstructorQualityReportDetailDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;
    private readonly IMapper _mapper;

    public GetInstructorQualityReportDetailQueryHandler(
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

    public async Task<InstructorQualityReportDetailDto> Handle(GetInstructorQualityReportDetailQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        // 1. Fetch report
        var reportDto = await _context.QualityCheckReports
            .Where(r => r.Id == request.ReportId && r.RequestedByRole == "Instructor")
            .ProjectTo<InstructorQualityReportDetailDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);

        Guard.Against.NotFound(request.ReportId, reportDto);

        // 2. Ownership access verification
        var hasAccess = await _courseAuth.HasCourseAccessAsync(
            reportDto.CourseId, userId, CoursePermission.Manage, cancellationToken);

        if (!hasAccess)
        {
            return null;
        }

        // 3. Check if latest report
        var isLatest = !await _context.QualityCheckReports
            .AnyAsync(r => r.CourseId == reportDto.CourseId 
                        && r.RequestedByRole == "Instructor" 
                        && r.Created > reportDto.Created, cancellationToken);

        reportDto.IsLatest = isLatest;

        return reportDto;
    }
}


