using Edunary.Application.Users.Commands.CreateUserCommand;
using Edunary.Application.Users.Queries.GetBasicUserInfoQuery;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Edunary.Web.Endpoints;

public class User : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapPost(Create, "create")
            .MapGet(GetBasicInfo, "basic-info");

    }
    public async Task<IResult> Create(ISender sender, CreateUserCommand command)
    {
        var result = await sender.Send(command);

        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    public async Task<UserVm> GetBasicInfo(ISender sender)
    {
        var query = new GetBasicUserInfoQuery();
        var result = await sender.Send(query);
        return result;
    }
}
