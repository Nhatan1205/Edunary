using Edunary.Application.Common.Models;
using Edunary.Application.TaxProfiles.Commands.UpsertMyTaxProfile;
using Edunary.Application.TaxProfiles.Models;
using Edunary.Application.TaxProfiles.Queries.GetMyTaxProfile;
using MediatR;

namespace Edunary.Web.Endpoints;

public class InstructorTax : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetMyProfile, "profile")
            .MapPut(UpsertProfile, "profile");
    }

    public async Task<TaxProfileDto> GetMyProfile(ISender sender)
        => await sender.Send(new GetMyTaxProfileQuery());

    public async Task<IResult> UpsertProfile(ISender sender, UpsertMyTaxProfileCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok() : Results.BadRequest(result.Errors);
    }
}
