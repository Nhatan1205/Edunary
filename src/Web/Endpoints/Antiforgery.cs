using Microsoft.AspNetCore.Antiforgery;
using Microsoft.Win32;

namespace Edunary.Web.Endpoints;

public class Antiforgery : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetToken, "token");
    }

    public IResult GetToken(IAntiforgery forgeryService, HttpContext context)
    {
        var tokens = forgeryService.GetAndStoreTokens(context);
        context.Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken!,
                new CookieOptions { HttpOnly = false });

        return Results.Ok();
    }
}
