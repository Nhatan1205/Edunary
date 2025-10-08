using MediatR;
using Microsoft.AspNetCore.Mvc;
using Edunary.Application.Payments.Commands;
using Edunary.Application.Payments.Queries;
using Edunary.Application.Common.Interfaces;

namespace Edunary.Web.Endpoints;

public class PaymentEndpoints : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapPost(CreatePaymentIntent, "create-payment-intent")
            .MapPost(ConfirmPayment, "confirm-payment")
            .MapGet(GetPaymentStatus, "payment-status/{paymentIntentId}");
    }

    public async Task<CreatePaymentIntentResponse> CreatePaymentIntent(ISender sender, CreatePaymentIntentCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<ConfirmPaymentResponse> ConfirmPayment(ISender sender, ConfirmPaymentCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<PaymentStatusResponse> GetPaymentStatus(ISender sender, string paymentIntentId)
    {
        return await sender.Send(new GetPaymentStatusQuery { PaymentIntentId = paymentIntentId });
    }
}