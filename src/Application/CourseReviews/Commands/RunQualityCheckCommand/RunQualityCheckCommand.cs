using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.CourseReviews.Commands.RunQualityCheckCommand;

public record RunQualityCheckCommand : IRequest<ReturnResult<RunQualityCheckResultDto>>
{
    public int CourseId { get; init; }
}

public class RunQualityCheckCommandHandler : IRequestHandler<RunQualityCheckCommand, ReturnResult<RunQualityCheckResultDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IQualityCheckJobService _jobService;

    public RunQualityCheckCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IQualityCheckJobService jobService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _jobService = jobService;
    }

    public async Task<ReturnResult<RunQualityCheckResultDto>> Handle(RunQualityCheckCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var courseExists = await _context.Courses
                .AnyAsync(c => c.Id == request.CourseId, cancellationToken);

            if (!courseExists)
            {
                return new ReturnResult<RunQualityCheckResultDto>
                {
                    Result = null,
                    Message = "Course not found."
                };
            }

            var report = new QualityCheckReport
            {
                CourseId = request.CourseId,
                Status = QualityCheckStatus.Processing,
                AnalysisSummary = "Starting review analysis...",
            };

            _context.QualityCheckReports.Add(report);
            await _context.SaveChangesAsync(cancellationToken);

            _jobService.EnqueueQualityCheck(_currentUserService.UserId, request.CourseId, report.Id);

            var dto = new RunQualityCheckResultDto
            {
                ReportId = report.Id
            };

            return new ReturnResult<RunQualityCheckResultDto>
            {
                Result = dto,
                Message = "Quality check started."
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
