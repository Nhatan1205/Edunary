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
            .MapGet(GetMyInstructorTaxProfile, "profile")
            .MapPut(UpsertMyTaxProfile, "profile");
    }

    public async Task<TaxProfileDto> GetMyInstructorTaxProfile(ISender sender)
        => await sender.Send(new GetMyTaxProfileQuery());

    public async Task<IResult> UpsertMyTaxProfile(ISender sender, UpsertMyTaxProfileCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok() : Results.BadRequest(result.Errors);
    }
}
