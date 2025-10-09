
using Edunary.Infrastructure.Hubs;

namespace Edunary.Web.Endpoints;

public class Notification : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapHub<SignalRServiceHub>("/NotificationHub");
    }
}
