using Edunary.Application.Common.Models;
using Edunary.Application.TaxProfiles.Commands.UpsertMyTaxProfile;
using Edunary.Application.TaxProfiles.Models;
using Edunary.Application.TaxProfiles.Queries.GetMyTaxProfile;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class TaxProfile : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetMyTaxProfile)
            .MapPut(UpdateMyTaxProfile);
    }

    public async Task<TaxProfileDto> GetMyTaxProfile(ISender sender)
        => await sender.Send(new GetMyTaxProfileQuery());

    public async Task<IResult> UpdateMyTaxProfile(ISender sender, [FromBody] UpsertMyTaxProfileCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }
}
