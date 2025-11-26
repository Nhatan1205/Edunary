using Edunary.Application.Carts.Commands.AddToCartCommand;
using Edunary.Application.Carts.Commands.RemoveFromCartCommand;
using Edunary.Application.Carts.Queries.GetCartItemsQuery;
using Edunary.Application.Common.Models;
using Microsoft.AspNetCore.Mvc;

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

    [ProducesResponseType(typeof(CartResponse), StatusCodes.Status200OK)]
    public async Task<IResult> AddToCart(ISender sender, AddToCartCommand command)
    {
        var result = await sender.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }
        var response = new CartResponse { Message = result.Data.ToString() };
        return Results.Ok(response);
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
