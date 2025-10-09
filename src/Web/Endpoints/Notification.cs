
using Edunary.Application.Courses.Queries.GetPublicCourseById;
using Edunary.Application.Notifications.Queries.GetNotificationsByUserIdQuery;
using Edunary.Infrastructure.Hubs;

namespace Edunary.Web.Endpoints;

public class Notification : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapHub<SignalRServiceHub>("/NotificationHub").RequireAuthorization();
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetNotficationsByUserId);
    }

    public async Task<NotificationsVm> GetNotficationsByUserId(ISender sender)
    {
        return await sender.Send(new GetNotificationsByUserIdQuery());
    }
}
