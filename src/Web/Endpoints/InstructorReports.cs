using Edunary.Application.InstructorReports.Queries.GetInstructorReport;
using MediatR;

namespace Edunary.Web.Endpoints;

public class InstructorReports : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetInstructorReport, "report");
    }

    public async Task<InstructorReportDto> GetInstructorReport(
        ISender sender,
        [AsParameters] GetInstructorReportQuery query)
        => await sender.Send(query);
}
