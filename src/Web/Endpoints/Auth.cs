using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Users.Commands.CreateUserCommand;
using Edunary.Domain.Common;
using Edunary.Infrastructure.Identity;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity.UI.V4.Pages.Account.Internal;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class Auth : EndpointGroupBase
{ 
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup(this)
            .MapPost(Login, "login")
            .MapPost(Register, "register")
            .MapGet(RefreshToken, "refresh-token");
    }
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    public async Task<IResult> Login(IIdentityService identityService, [FromBody] AuthenticateModel model)
    {

        var rs = await identityService.Login(model.Email, model.Password);

        if (!rs.Succeeded)
        {

            return Results.BadRequest(new { ErrorMessage = rs.Message });
        }
        else
        {
            if (!model.Email.Contains("@"))
            {
                //var _ = await Mediator.Send(new ChangeStatusOnlineWhenLogin()
                //{
                //    Extension = model.Email
                //});
            }

            return Results.Ok(new LoginResponse { Token = rs.Data });
        }
    }
    public async Task<IResult> Register(ISender sender, [FromBody] AuthenticateModel model)
    {
        var result = await sender.Send(new CreateUserCommand()
        {
            UserName = model.Email,
            PhoneNumber = model.PhoneNumber!,
            Email = model.Email,
            Password = model.Password!,
            FullName = model.FullName!
        });
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    public async Task<IResult> RefreshToken(IIdentityService identityService)
    {
        var rs = await identityService.RefreshToken();
        if (!rs.Succeeded)
        {

            return Results.Json(
                new { ErrorMessage = rs.Message },
                statusCode: StatusCodes.Status401Unauthorized
            );
        }

        return Results.Ok(new LoginResponse { Token = rs.Data });
    }
}
