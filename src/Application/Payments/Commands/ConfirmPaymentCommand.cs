using MediatR;

namespace Edunary.Application.Payments.Commands;

public class ConfirmPaymentCommand : IRequest<ConfirmPaymentResponse>
{
    public string PaymentIntentId { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
}

public class ConfirmPaymentResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string OrderId { get; set; } = string.Empty;
}