using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.InstructorReports.Queries.GetInstructorReport;

public record GetInstructorReportQuery : IRequest<InstructorReportDto>
{
    public DateTimeOffset? From { get; init; }
    public DateTimeOffset? To { get; init; }
    public int? CourseId { get; init; }
}

public class GetInstructorReportQueryHandler : IRequestHandler<GetInstructorReportQuery, InstructorReportDto>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly InstructorReportService _reportService;

    public GetInstructorReportQueryHandler(
        ICurrentUserService currentUserService,
        InstructorReportService reportService)
    {
        _currentUserService = currentUserService;
        _reportService = reportService;
    }

    public async Task<InstructorReportDto> Handle(GetInstructorReportQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return InstructorReportService.EmptyReport();
        }

        return await _reportService.BuildAsync(
            userId,
            request.From,
            request.To,
            request.CourseId,
            cancellationToken);
    }
}
