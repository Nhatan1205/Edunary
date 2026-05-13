
using Edunary.Application.Notifications.Commands.UpdateNotificationIsReadCommand;
using Edunary.Application.Notifications.Queries.GetNotificationsByUserIdQuery;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class Notification : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetNotficationsByUserId)
            .MapPut(UpdateNotificationStatus);
    }

    public async Task<NotificationsVm> GetNotficationsByUserId(ISender sender, [AsParameters] GetNotificationsByUserIdQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<IResult> UpdateNotificationStatus(ISender sender, [FromBody] UpdateNotificationStatusCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }
}
