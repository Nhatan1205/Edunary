using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.CourseReviews.Commands.RunQualityCheckCommand;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using MediatR;

namespace Edunary.Application.CourseReviews.Commands.RunQualityCheckDiffCommand;

public record RunQualityCheckDiffCommand : IRequest<ReturnResult<RunQualityCheckResultDto>>
{
    public int CourseId { get; init; }
}

public class RunQualityCheckDiffCommandHandler : IRequestHandler<RunQualityCheckDiffCommand, ReturnResult<RunQualityCheckResultDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IQualityCheckJobService _jobService;

    public RunQualityCheckDiffCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IQualityCheckJobService jobService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _jobService = jobService;
    }

    public async Task<ReturnResult<RunQualityCheckResultDto>> Handle(RunQualityCheckDiffCommand request, CancellationToken cancellationToken)
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
                AnalysisSummary = "Starting diff-based review analysis...",
                IsDiff = true
            };

            _context.QualityCheckReports.Add(report);
            await _context.SaveChangesAsync(cancellationToken);

            _jobService.EnqueueQualityCheckDiff(_currentUserService.UserId, request.CourseId, report.Id);

            var dto = new RunQualityCheckResultDto
            {
                ReportId = report.Id
            };

            return new ReturnResult<RunQualityCheckResultDto>
            {
                Result = dto,
                Message = "Diff-based quality check started."
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
