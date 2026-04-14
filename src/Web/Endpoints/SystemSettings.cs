using Edunary.Application.SystemSettings.Commands.UpdateSystemSettingsCommand;
using Edunary.Application.SystemSettings.Queries.GetSystemSettingsQuery;
using Edunary.Domain.Constants;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class SystemSettings : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization(Policies.SuperAdmin)
            .MapPost(GetSystemSettings)
            .MapPut(UpdateSystemSettings);
    }

    public async Task<List<SystemSettingDto>> GetSystemSettings(ISender sender, [FromBody] GetSystemSettingsQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<IResult> UpdateSystemSettings(ISender sender, [FromBody] UpdateSystemSettingsCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }
}
