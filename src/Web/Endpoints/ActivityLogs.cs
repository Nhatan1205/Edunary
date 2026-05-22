using Edunary.Application.ActivityLogs.Commands.DeleteActivityLogsCommand;
using Edunary.Application.ActivityLogs.Queries.GetActivityLogsQuery;
using Edunary.Application.Common.Models;
using Edunary.Domain.Constants;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class ActivityLogs : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization(Policies.Admin)
            .MapGet(GetActivityLogs)
            .MapDelete(DeleteActivityLogs);
    }

    public async Task<PaginatedList<ActivityLogDto>> GetActivityLogs(ISender sender, [AsParameters] GetActivityLogsQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<Result> DeleteActivityLogs(ISender sender, [FromBody] DeleteActivityLogsCommand command)
    {
        return await sender.Send(command);
    }
}
