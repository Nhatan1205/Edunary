using Edunary.Application.Users.Commands.ChangePasswordCommand;
using Edunary.Application.Users.Commands.CreateUserCommand;
using Edunary.Application.Users.Commands.UpdateUserAvatarCommand;
using Edunary.Application.Users.Commands.UpdateUserInfoCommand;
using Edunary.Application.Users.Queries.GetBasicUserInfoQuery;
using Edunary.Application.Users.Queries.GetPublicUserInfoQuery;
using Edunary.Application.Users.Queries.GetTopInstructorsQuery;
using Microsoft.AspNetCore.Http.HttpResults;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace Edunary.Web.Endpoints;

public class User : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapPost(Create, "create")
            .MapPut(UpdateUserInfo)
            .MapPut(UpdateUserAvatar, "avatar")
            .MapGet(GetBasicInfo, "basic-info")
            .MapPost(ChangePassword, "change-password");
        //public endpoint
        app.MapGroup(this)
            .MapGet(GetPublicUserInfo)
            .MapGet(GetTopInstructors, "top-instructors");

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

    public async Task<IResult> UpdateUserInfo(ISender sender, UpdateUserInfoCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }
    public async Task<IResult> UpdateUserAvatar(ISender sender, UpdateUserAvatarCommand command)
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

    public async Task<IResult> ChangePassword(ISender sender, ChangePasswordCommand command)
    {
        var result = await sender.Send(command);

        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    public async Task<PublicProfileDto> GetPublicUserInfo(ISender sender, [AsParameters] GetPublicUserInfoQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<List<TopInstructorDto>> GetTopInstructors(ISender sender, [AsParameters] GetTopInstructorsQuery query)
    {
        return await sender.Send(query);
    }
}
