using MediatR;

namespace Edunary.Application.Payments.Commands.ConfirmPaymentCommand;

public class ConfirmPaymentCommand : IRequest<ConfirmPaymentDto>
{
    public string PaymentIntentId { get; set; } = string.Empty;
}