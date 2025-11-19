using Edunary.Application.Carts.Commands.AddToCartCommand;
using Edunary.Application.Carts.Commands.RemoveFromCartCommand;
using Edunary.Application.Carts.Queries.GetCartItemsQuery;

namespace Edunary.Web.Endpoints;

public class Cart : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetCartItems)
            .MapPost(AddToCart)
            .MapDelete(RemoveFromCart, "{cartItemId}");
    }

    public async Task<List<CartItemDto>> GetCartItems(ISender sender)
    {
        return await sender.Send(new GetCartItemsQuery());
    }

    public async Task<IResult> AddToCart(ISender sender, AddToCartCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    public async Task<IResult> RemoveFromCart(ISender sender, int cartItemId)
    {
        var result = await sender.Send(new RemoveFromCartCommand { CartItemId = cartItemId });
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }
}
