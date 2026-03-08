using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Payments.Commands.ConfirmPaymentCommand;
using Edunary.Application.Payments.Commands.CreatePaymentIntentCommand;
using Edunary.Application.Payments.Queries.GetPaymentStatusQuery;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Edunary.Web.Endpoints;

public class Payment : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapPost(CreatePaymentIntent, "create-payment-intent")
            .MapPost(ConfirmPayment, "confirm-payment");

        app.MapGroup(this)
            .MapGet(GetPaymentStatus, "payment-status/{paymentIntentId}");
    }

    public async Task<ReturnResult<CreatePaymentIntentDto>> CreatePaymentIntent(ISender sender, CreatePaymentIntentCommand command)
    {
        return await sender.Send(command);   
    }

    public async Task<ConfirmPaymentDto> ConfirmPayment(ISender sender, ConfirmPaymentCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<PaymentStatusDto> GetPaymentStatus(ISender sender, string paymentIntentId)
    {
        var result = await sender.Send(new GetPaymentStatusQuery { PaymentIntentId = paymentIntentId });
        
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(result.Message);
        }
        
        return (PaymentStatusDto)result.Data;
    }
}
