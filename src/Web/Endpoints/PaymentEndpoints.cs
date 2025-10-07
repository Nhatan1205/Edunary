using MediatR;
using Microsoft.AspNetCore.Mvc;
using Edunary.Application.Payments.Commands;
using Edunary.Application.Common.Interfaces;

namespace Edunary.Web.Endpoints;

public class PaymentEndpoints : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapPost(CreatePaymentIntent, "create-payment-intent");
    }

    public async Task<CreatePaymentIntentResponse> CreatePaymentIntent(ISender sender, CreatePaymentIntentCommand command)
    {
        return await sender.Send(command);
    }
}