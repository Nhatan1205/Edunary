using Edunary.Application.LearnerProfiles.Commands.UpsertLearnerProfileCommand;
using Edunary.Application.LearnerProfiles.Queries.GetMyLearnerProfileQuery;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class LearnerProfiles : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetMyProfile)
            .MapPut(UpsertProfile);
    }

    public async Task<LearnerProfileDto> GetMyProfile(ISender sender, [AsParameters] GetMyLearnerProfileQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<IResult> UpsertProfile(ISender sender, [FromBody] UpsertLearnerProfileCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }
}
