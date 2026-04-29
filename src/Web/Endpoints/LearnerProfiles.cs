using Edunary.Application.Common.Models;
using Edunary.Application.LearnerProfiles.Commands.UpsertLearnerProfileCommand;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class LearnerProfiles : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapPut(UpsertProfile);
    }

    public async Task<IResult> UpsertProfile(ISender sender, [FromBody] UpsertLearnerProfileCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }
}
