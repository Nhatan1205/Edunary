using Edunary.Application.Common.Models;
using Edunary.Application.Coupons.Commands.CreateCoupon;
using Edunary.Application.Coupons.Commands.DeactivateCoupon;
using Edunary.Application.Coupons.Models;
using Edunary.Application.Coupons.Queries.GetCoupons;
using Edunary.Application.Coupons.Queries.ValidateCoupon;
using MediatR;

namespace Edunary.Web.Endpoints;

public class Coupons : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup(this).RequireAuthorization();

        group.MapGet(GetCoupons);
        group.MapPost(CreateCoupon);
        group.MapPost(ValidateCoupon, "validate");
        group.MapPatch(DeactivateCoupon, "{id:int}/deactivate");
    }

    public async Task<PaginatedList<CouponDto>> GetCoupons(ISender sender, [AsParameters] GetCouponsQuery query)
        => await sender.Send(query);

    public async Task<IResult> CreateCoupon(ISender sender, CreateCouponCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public async Task<CouponApplicationResult> ValidateCoupon(ISender sender, ValidateCouponQuery query)
        => await sender.Send(query);

    public async Task<IResult> DeactivateCoupon(ISender sender, int id)
    {
        var result = await sender.Send(new DeactivateCouponCommand { Id = id });
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }
}
