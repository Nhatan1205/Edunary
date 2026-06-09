using Edunary.Application.ServiceHealth.Queries.GetServiceHealthQuery;
using Edunary.Domain.Constants;

namespace Edunary.Web.Endpoints;

public class ServiceHealth : EndpointGroupBase
{
    public override void Map(WebApplication app) =>
        app.MapGroup(this)
           .RequireAuthorization(Policies.Admin)
           .MapGet(GetServiceHealth, "status");

    public async Task<ServiceHealthDto> GetServiceHealth(ISender sender)
        => await sender.Send(new GetServiceHealthQuery());
}
