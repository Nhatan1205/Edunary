using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.CourseReviews.Commands.RunQualityCheckCommand;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using MediatR;

namespace Edunary.Application.CourseReviews.Commands.RunInstructorQualityCheckCommand;

public record RunInstructorQualityCheckCommand : IRequest<ReturnResult<RunQualityCheckResultDto>>
{
    public int CourseId { get; init; }
}

public class RunInstructorQualityCheckCommandHandler : IRequestHandler<RunInstructorQualityCheckCommand, ReturnResult<RunQualityCheckResultDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;
    private readonly IQualityCheckJobService _jobService;

    public RunInstructorQualityCheckCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth,
        IQualityCheckJobService jobService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
        _jobService = jobService;
    }

    public async Task<ReturnResult<RunQualityCheckResultDto>> Handle(RunInstructorQualityCheckCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = _currentUserService.UserId;

            // 1. Authorize ownership/manage access to the course
            var hasAccess = await _courseAuth.HasCourseAccessAsync(
                request.CourseId, userId, CoursePermission.Manage, cancellationToken);

            if (!hasAccess)
            {
                return new ReturnResult<RunQualityCheckResultDto>
                {
                    Result = null,
                    Message = "You do not have permission to run quality check on this course."
                };
            }

            // 2. Rate limit: Only 1 run per week (7 days) for instructors
            var oneWeekAgo = DateTimeOffset.UtcNow.AddDays(-7);
            var recentReport = await _context.QualityCheckReports
                .Where(r => r.CourseId == request.CourseId
                         && r.RequestedByRole == "Instructor"
                         && r.Created >= oneWeekAgo)
                .OrderByDescending(r => r.Created)
                .FirstOrDefaultAsync(cancellationToken);

            if (recentReport != null)
            {
                var nextAvailableTime = recentReport.Created.AddDays(7);
                var formattedTime = nextAvailableTime.ToString("MMMM dd, yyyy HH:mm UTC");
                return new ReturnResult<RunQualityCheckResultDto>
                {
                    Result = null,
                    Message = $"AI Quality Check is rate limited to once per week. You can run it again after {formattedTime}."
                };
            }

            // 3. Create Processing Report tagged as RequestedByRole = "Instructor"
            var report = new QualityCheckReport
            {
                CourseId = request.CourseId,
                Status = QualityCheckStatus.Processing,
                AnalysisSummary = "Starting AI content quality analysis...",
                RequestedByRole = "Instructor"
            };

            _context.QualityCheckReports.Add(report);
            await _context.SaveChangesAsync(cancellationToken);

            
            _jobService.EnqueueQualityCheck(userId, request.CourseId, report.Id);

            var dto = new RunQualityCheckResultDto
            {
                ReportId = report.Id
            };

            return new ReturnResult<RunQualityCheckResultDto>
            {
                Result = dto,
                Message = "AI Quality check started."
            };
        }
        catch (Exception ex)
        {
            return new ReturnResult<RunQualityCheckResultDto>
            {
                Result = null,
                Message = ex.Message
            };
        }
    }
}
