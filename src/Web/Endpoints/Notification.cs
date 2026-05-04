
using Edunary.Application.Courses.Commands.UpdateCourse;
using Edunary.Application.Courses.Queries.GetPublicCourseById;
using Edunary.Application.Notifications.Commands.UpdateNotificationIsReadCommand;
using Edunary.Application.Notifications.Queries.GetNotificationsByUserIdQuery;
using Edunary.Infrastructure.Hubs;
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

    public async Task<NotificationsVm> GetNotficationsByUserId(ISender sender)
    {
        return await sender.Send(new GetNotificationsByUserIdQuery());
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
